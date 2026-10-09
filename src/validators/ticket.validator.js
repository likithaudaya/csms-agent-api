import { z } from 'zod';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '../constants/ticket.constants.js';

export const listTicketsQuerySchema = z.object({
  search: z.string().trim().max(100, 'Search is too long').optional(),
  status: z.enum(TICKET_STATUSES, { error: 'Invalid status' }).optional(),
  priority: z.enum(TICKET_PRIORITIES, { error: 'Invalid priority' }).optional(),
  category: z.enum(TICKET_CATEGORIES, { error: 'Invalid category' }).optional(),
  page: z.coerce
    .number({ error: 'Page must be a number' })
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'Limit must be a number' })
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot be more than 50')
    .default(10),
});

export const ticketIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ticket id'),
});