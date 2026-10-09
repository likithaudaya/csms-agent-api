import Ticket from '../models/Ticket.js';

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listAgentTickets(
  agentId,
  { search, status, priority, category, page, limit }
) {
  const filter = { assignedAgentId: agentId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ subject: pattern }, { ticketNumber: pattern }];
  }

  const skip = (page - 1) * limit;

  const [found, total] = await Promise.all([
    Ticket.find(filter)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  const tickets = found.map(({ customerId, ...rest }) => ({
    ...rest,
    customer: customerId,
  }));

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}