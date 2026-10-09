import mongoose from 'mongoose';

const internalNoteSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      required: [true, 'Note is required'],
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

internalNoteSchema.index({ ticketId: 1, createdAt: 1 });

export default mongoose.model('InternalNote', internalNoteSchema);