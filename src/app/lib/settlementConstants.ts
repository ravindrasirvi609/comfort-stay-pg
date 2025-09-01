/**
 * Client-safe constants for settlement functionality
 */

/**
 * Settlement reasons dropdown options
 */
export const SETTLEMENT_REASONS = [
  { value: "Mid-month entry", label: "Mid-month entry" },
  { value: "Special discount", label: "Special discount" },
  { value: "Compensation", label: "Compensation" },
  { value: "Admin discretion", label: "Admin discretion" },
  { value: "Other", label: "Other" },
] as const;

/**
 * Format settlement reason for display
 */
export function formatSettlementReason(reason: string): string {
  switch (reason) {
    case "Mid-month entry":
      return "🏠 Mid-month Entry";
    case "Special discount":
      return "💸 Special Discount";
    case "Compensation":
      return "🤝 Compensation";
    case "Admin discretion":
      return "⚖️ Admin Discretion";
    case "Other":
      return "📝 Other";
    default:
      return reason;
  }
}

export type SettlementReason = (typeof SETTLEMENT_REASONS)[number]["value"];
