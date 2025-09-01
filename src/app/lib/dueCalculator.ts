import DueSettlement from "@/app/api/models/DueSettlement";
import Payment from "@/app/api/models/Payment";
import UserDue from "@/app/api/models/UserDue";

/**
 * Enhanced due calculation result including settlements
 */
export interface DueCalculationWithSettlements {
  currentMonthDue: number;
  previousUnpaidDue: number;
  totalDue: number;
  totalPaid: number;
  totalSettled: number;
  remainingDue: number;
  effectiveDue: number; // totalDue - totalPaid - totalSettled
  dueStatus: "Paid" | "Partial" | "Unpaid" | "Overdue";
  hasSettlements: boolean;
}

/**
 * Settlement summary for a user and month
 */
export interface SettlementSummary {
  totalSettled: number;
  settlementCount: number;
  settlements: Array<{
    _id: string;
    amount: number;
    reason: string;
    remarks?: string;
    settledBy: {
      name: string;
      email: string;
    };
    settledAt: Date;
  }>;
}

/**
 * Calculate total due amount considering payments and settlements
 */
export async function calculateDueWithSettlements(
  userId: string,
  month: string,
  currentMonthDue: number,
  previousUnpaidDue: number
): Promise<DueCalculationWithSettlements> {
  try {
    // Get total payments for this month
    const payments = await Payment.find({
      userId,
      months: month,
      paymentStatus: "Paid",
      isDepositPayment: false,
      isActive: true,
    });

    const totalPaid = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Get total settlements for this month
    const settlements = await DueSettlement.find({
      userId,
      month,
      isActive: true,
    });

    const totalSettled = settlements.reduce(
      (sum, settlement) => sum + settlement.amount,
      0
    );

    // Calculate totals
    const totalDue = currentMonthDue + previousUnpaidDue;
    const effectiveDue = Math.max(0, totalDue - totalPaid - totalSettled);
    const remainingDue = effectiveDue; // For compatibility with existing code

    // Determine status
    let dueStatus: "Paid" | "Partial" | "Unpaid" | "Overdue";

    if (effectiveDue === 0) {
      dueStatus = "Paid";
    } else if (totalPaid > 0 || totalSettled > 0) {
      dueStatus = "Partial";
    } else {
      dueStatus = "Unpaid";
    }

    return {
      currentMonthDue,
      previousUnpaidDue,
      totalDue,
      totalPaid,
      totalSettled,
      remainingDue,
      effectiveDue,
      dueStatus,
      hasSettlements: totalSettled > 0,
    };
  } catch (error) {
    console.error("Error calculating due with settlements:", error);
    throw error;
  }
}

/**
 * Get settlement summary for a user and month
 */
export async function getSettlementSummary(
  userId: string,
  month: string
): Promise<SettlementSummary> {
  try {
    const settlements = await DueSettlement.find({
      userId,
      month,
      isActive: true,
    })
      .populate("settledBy", "name email")
      .sort({ settledAt: -1 });

    const totalSettled = settlements.reduce(
      (sum, settlement) => sum + settlement.amount,
      0
    );

    return {
      totalSettled,
      settlementCount: settlements.length,
      settlements: settlements.map((settlement) => ({
        _id: settlement._id.toString(),
        amount: settlement.amount,
        reason: settlement.reason,
        remarks: settlement.remarks,
        settledBy: {
          name: (settlement.settledBy as any).name,
          email: (settlement.settledBy as any).email,
        },
        settledAt: settlement.settledAt,
      })),
    };
  } catch (error) {
    console.error("Error getting settlement summary:", error);
    throw error;
  }
}

/**
 * Validate settlement request - Enhanced to handle users without UserDue records
 */
export async function validateSettlement(
  userId: string,
  month: string,
  settlementAmount: number
): Promise<{
  isValid: boolean;
  error?: string;
  maxSettlableAmount?: number;
  currentDue?: number;
}> {
  try {
    // Basic validation
    if (settlementAmount <= 0) {
      return {
        isValid: false,
        error: "Settlement amount must be greater than 0",
      };
    }

    // Parse month and year
    const [monthName, yearStr] = month.split(" ");
    const year = parseInt(yearStr);
    const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

    // First, try to get user's due record for this month
    const due = await UserDue.findOne({
      userId,
      year,
      monthNumber,
      isActive: true,
    });

    let maxSettlableAmount = 0;

    if (due) {
      // User has due record - use settlement-aware calculation
      const dueCalc = await calculateDueWithSettlements(
        userId,
        month,
        due.currentMonthDue,
        due.previousUnpaidDue
      );
      maxSettlableAmount = dueCalc.effectiveDue;
    } else {
      // No UserDue record - calculate legacy due amount using the same logic as with-dues endpoint
      const User = (await import("@/app/api/models/User")).default;
      const Payment = (await import("@/app/api/models/Payment")).default;

      const user = await User.findById(userId)
        .populate("roomId", "price")
        .lean();

      if (!user || !(user as any).roomId) {
        return {
          isValid: false,
          error: "User not found or no room assigned",
        };
      }

      // Type-safe access to populated roomId and user properties
      const roomPrice = (user as any).roomId?.price || 0;
      const moveInDate = (user as any).moveInDate
        ? new Date((user as any).moveInDate)
        : null;

      if (!moveInDate || roomPrice <= 0) {
        return {
          isValid: false,
          error: "Invalid user data - no move-in date or room price",
        };
      }

      // Calculate "Rent Till Now" - cumulative rent from check-in to current month
      let rentTillNow = 0;
      const moveInYear = moveInDate.getFullYear();
      const moveInMonth = moveInDate.getMonth() + 1;

      for (let calcYear = moveInYear; calcYear <= year; calcYear++) {
        const startMonth = calcYear === moveInYear ? moveInMonth : 1;
        const endMonth = calcYear === year ? monthNumber : 12;

        for (let calcMonth = startMonth; calcMonth <= endMonth; calcMonth++) {
          if (calcYear === moveInYear && calcMonth === moveInMonth) {
            // First month - calculate prorated rent
            const daysInMonth = new Date(calcYear, calcMonth, 0).getDate();
            const checkInDay = moveInDate.getDate();
            const daysCovered = daysInMonth - checkInDay + 1;
            const dailyRate = roomPrice / daysInMonth;
            rentTillNow += Math.ceil(dailyRate * daysCovered);
          } else {
            // Full month rent
            rentTillNow += roomPrice;
          }
        }
      }

      // Get total payments for this user (all time)
      const allPayments = await Payment.find({
        userId,
        paymentStatus: "Paid",
        isDepositPayment: false,
        isActive: true,
      }).lean();

      const totalPaid = allPayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      // Get existing settlements for this month
      const existingSettlements = await DueSettlement.find({
        userId,
        month,
        isActive: true,
      });

      const totalSettled = existingSettlements.reduce(
        (sum, settlement) => sum + settlement.amount,
        0
      );

      // Calculate effective due: rentTillNow - totalPaid - totalSettled
      maxSettlableAmount = Math.max(0, rentTillNow - totalPaid - totalSettled);
    }

    if (settlementAmount > maxSettlableAmount) {
      return {
        isValid: false,
        error: `Settlement amount (₹${settlementAmount}) exceeds remaining due (₹${maxSettlableAmount})`,
        maxSettlableAmount,
        currentDue: maxSettlableAmount,
      };
    }

    if (maxSettlableAmount <= 0) {
      return {
        isValid: false,
        error: "No due amount to settle for this user",
        maxSettlableAmount: 0,
        currentDue: 0,
      };
    }

    return {
      isValid: true,
      maxSettlableAmount,
      currentDue: maxSettlableAmount,
    };
  } catch (error) {
    console.error("Error validating settlement:", error);
    return {
      isValid: false,
      error: "Failed to validate settlement request",
    };
  }
}

/**
 * Get user's current due amount considering settlements
 */
export async function getUserCurrentDue(
  userId: string,
  month: string
): Promise<number> {
  try {
    // Parse month and year
    const [monthName, yearStr] = month.split(" ");
    const year = parseInt(yearStr);
    const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

    // Get user's due record for this month
    const due = await UserDue.findOne({
      userId,
      year,
      monthNumber,
      isActive: true,
    });

    if (!due) {
      return 0;
    }

    // Calculate current effective due including settlements
    const dueCalc = await calculateDueWithSettlements(
      userId,
      month,
      due.currentMonthDue,
      due.previousUnpaidDue
    );

    return dueCalc.effectiveDue;
  } catch (error) {
    console.error("Error getting user current due:", error);
    return 0;
  }
}
