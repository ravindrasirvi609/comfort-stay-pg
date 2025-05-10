import mongoose, { Schema } from "mongoose";

interface ICounter {
  name: string;
  value: number;
}

const CounterSchema = new Schema<ICounter>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Number,
    default: 0,
  },
});

// Create or get the model
const Counter =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);

export default Counter;
