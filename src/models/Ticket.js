import mongoose from 'mongoose';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '../constants/ticket.constants.js';

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: TICKET_CATEGORIES,
      required: [true, 'Category is required'],
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: 'Medium',
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'Open',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ticketSchema.index({ assignedAgentId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Ticket', ticketSchema);