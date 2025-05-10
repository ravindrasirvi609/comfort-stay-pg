import Counter from "@/app/api/models/Counter";

/**
 * Generates a sequential receipt number in the format C00001, C00002, etc.
 * @returns The next receipt number in sequence
 */
export const generateReceiptNumber = async (): Promise<string> => {
  // Find or create the receipt counter
  let counter = await Counter.findOne({ name: "receiptCounter" });

  if (!counter) {
    // If counter doesn't exist, create it starting from 1 (not 0)
    counter = await Counter.create({ name: "receiptCounter", value: 1 });
  } else {
    // Increment the existing counter
    counter = await Counter.findOneAndUpdate(
      { name: "receiptCounter" },
      { $inc: { value: 1 } }, // Increment the counter by 1
      { new: true } // Return the updated document
    );
  }

  // Format the counter value with leading zeros (5 digits)
  const formattedNumber = counter.value.toString().padStart(5, "0");

  // Return the receipt number in the format C00001
  return `C${formattedNumber}`;
};
