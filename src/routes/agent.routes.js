import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { listTicketsQuerySchema } from '../validators/ticket.validator.js';
import { listTickets } from '../controllers/ticket.controller.js';

const router = Router();

router.use(authenticate, authorize('agent'));

router.get('/tickets', validate(listTicketsQuerySchema, 'query'), listTickets);

export default router;