import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

const Counter = mongoose.model('Counter', counterSchema);

export async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return counter.seq;
}

export default Counter;