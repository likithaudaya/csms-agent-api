import { listAgentTickets } from '../services/ticket.service.js';

export async function listTickets(req, res) {
  const data = await listAgentTickets(req.user._id, req.validated.query);

  res.status(200).json({
    success: true,
    message: 'Tickets fetched',
    data,
  });
}