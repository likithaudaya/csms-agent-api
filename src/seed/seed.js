import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Message from '../models/Message.js';
import InternalNote from '../models/InternalNote.js';
import Counter, { getNextSequence } from '../models/Counter.js';

const DEMO_PASSWORD = 'Password@123';
const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

const users = [
  { name: 'Admin User', email: 'admin@csms.com', role: 'admin' },
  { name: 'Likitha Agent', email: 'agent1@csms.com', role: 'agent' },
  { name: 'Ravi Agent', email: 'agent2@csms.com', role: 'agent' },
  { name: 'John Customer', email: 'john@example.com', role: 'customer' },
  { name: 'Priya Customer', email: 'priya@example.com', role: 'customer' },
];

// messages: [senderRole, text, minutesAfterTicketCreated]
// notes:    [text, minutesAfterTicketCreated]
// The first message is always the customer's original report.
const tickets = [
  {
    subject: 'Order not delivered after 10 days',
    category: 'Delivery Issue',
    priority: 'High',
    status: 'In Progress',
    customer: 'john@example.com',
    agent: 'agent1@csms.com',
    hoursAgo: 52,
    messages: [
      ['customer', 'I ordered a pair of shoes 10 days ago and the tracking has not updated since last Monday.', 0],
      ['agent', 'Hi John, sorry about the delay. I am checking with the courier now.', 25],
      ['customer', 'Thank you, please let me know as soon as possible.', 90],
      ['agent', 'The courier confirms the parcel was misrouted. I have asked them to reroute it.', 180],
    ],
    notes: [['Courier reference CR-88231. Escalated to the logistics team.', 200]],
  },
  {
    subject: 'Refund not received for cancelled order',
    category: 'Refund Issue',
    priority: 'Critical',
    status: 'Assigned',
    customer: 'priya@example.com',
    agent: 'agent1@csms.com',
    hoursAgo: 6,
    messages: [
      ['customer', 'I cancelled my order 12 days ago and the refund has still not reached my bank account.', 0],
    ],
    notes: [],
  },
  {
    subject: 'Wrong item received',
    category: 'Order Issue',
    priority: 'High',
    status: 'Waiting for Customer',
    customer: 'john@example.com',
    agent: 'agent1@csms.com',
    hoursAgo: 30,
    messages: [
      ['customer', 'I ordered a blue kettle but received a red one.', 0],
      ['agent', 'Sorry about that. Could you share a photo of the item and the packing slip?', 40],
    ],
    notes: [['Requested photo and packing slip. Replacement is ready to ship once confirmed.', 45]],
  },
  {
    subject: 'Payment deducted but order not placed',
    category: 'Payment Issue',
    priority: 'Critical',
    status: 'In Progress',
    customer: 'priya@example.com',
    agent: 'agent1@csms.com',
    hoursAgo: 20,
    messages: [
      ['customer', 'Money was deducted from my card but I did not get an order confirmation.', 0],
      ['agent', 'I can see the payment attempt. I am verifying it with the payments team.', 15],
    ],
    notes: [['Payment shows as pending at the gateway. Waiting for reconciliation.', 30]],
  },
  {
    subject: 'Cannot reset account password',
    category: 'Account Issue',
    priority: 'Medium',
    status: 'Resolved',
    customer: 'john@example.com',
    agent: 'agent1@csms.com',
    hoursAgo: 100,
    messages: [
      ['customer', 'The password reset email never arrives.', 0],
      ['agent', 'Please check your spam folder. I have also resent the link.', 20],
      ['customer', 'Found it in spam, it worked. Thanks!', 60],
      ['agent', 'Glad it is sorted. I am marking this as resolved.', 75],
    ],
    notes: [['Reset email was delayed by the mail provider. No account issue.', 70]],
  },
  {
    subject: 'Damaged packaging on delivery',
    category: 'Product Issue',
    priority: 'Low',
    status: 'Resolved',
    customer: 'priya@example.com',
    agent: 'agent1@csms.com',
    hoursAgo: 140,
    messages: [
      ['customer', 'The box arrived crushed but the product seems fine.', 0],
      ['agent', 'Thanks for letting us know. I have logged feedback with the courier.', 30],
      ['customer', 'Great, thank you.', 120],
    ],
    notes: [],
  },
  {
    subject: 'Request invoice for a past order',
    category: 'Order Issue',
    priority: 'Low',
    status: 'Closed',
    customer: 'john@example.com',
    agent: 'agent1@csms.com',
    hoursAgo: 200,
    messages: [
      ['customer', 'Please send me the invoice for my order from last month.', 0],
      ['agent', 'I have attached the invoice to your account. It is under Order History.', 60],
      ['customer', 'Received it, thank you.', 180],
      ['agent', 'Closing this ticket. Reach out any time.', 200],
    ],
    notes: [['Invoice generated manually from the billing portal.', 65]],
  },
  {
    subject: 'Delivery address change needed',
    category: 'Delivery Issue',
    priority: 'Medium',
    status: 'Assigned',
    customer: 'john@example.com',
    agent: 'agent1@csms.com',
    hoursAgo: 3,
    messages: [
      ['customer', 'I moved house and need to change the delivery address before my order ships.', 0],
    ],
    notes: [],
  },
  {
    subject: 'Product stopped working after one week',
    category: 'Product Issue',
    priority: 'High',
    status: 'In Progress',
    customer: 'priya@example.com',
    agent: 'agent2@csms.com',
    hoursAgo: 40,
    messages: [
      ['customer', 'The blender I bought stopped working after a week.', 0],
      ['agent', 'Sorry to hear that. Does it show any light or make any sound when you press the button?', 30],
      ['customer', 'No light and no sound at all.', 100],
      ['agent', 'Thanks. I am arranging a warranty replacement.', 140],
    ],
    notes: [['Within warranty. Replacement approved by supervisor.', 150]],
  },
  {
    subject: 'Charged twice for one order',
    category: 'Payment Issue',
    priority: 'High',
    status: 'Waiting for Customer',
    customer: 'john@example.com',
    agent: 'agent2@csms.com',
    hoursAgo: 28,
    messages: [
      ['customer', 'My card was charged twice for the same order.', 0],
      ['agent', 'I can see two charges. Could you confirm the last four digits of the card used?', 25],
    ],
    notes: [['Duplicate charge confirmed. Refund to be raised after the customer confirms the card.', 40]],
  },
  {
    subject: 'Question about return policy',
    category: 'Other',
    priority: 'Low',
    status: 'Resolved',
    customer: 'priya@example.com',
    agent: 'agent2@csms.com',
    hoursAgo: 90,
    messages: [
      ['customer', 'How many days do I have to return an unused item?', 0],
      ['agent', 'You can return unused items within 30 days of delivery.', 40],
      ['customer', 'Perfect, thanks.', 70],
    ],
    notes: [],
  },
  {
    subject: 'Unable to apply discount code',
    category: 'Order Issue',
    priority: 'Medium',
    status: 'Open',
    customer: 'priya@example.com',
    agent: null,
    hoursAgo: 1,
    messages: [['customer', 'My discount code is rejected at checkout.', 0]],
    notes: [],
  },
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed in production.');
    process.exit(1);
  }

  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Ticket.deleteMany({}),
    Message.deleteMany({}),
    InternalNote.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const createdUsers = await User.insertMany(
    users.map((u) => ({ ...u, passwordHash }))
  );
  const userByEmail = Object.fromEntries(createdUsers.map((u) => [u.email, u]));

  const now = Date.now();
  let messageCount = 0;
  let noteCount = 0;

  for (const t of tickets) {
    const customer = userByEmail[t.customer];
    const agent = t.agent ? userByEmail[t.agent] : null;
    const createdAt = new Date(now - t.hoursAgo * HOUR);

    const seq = await getNextSequence('ticket');
    const ticket = await Ticket.create({
      ticketNumber: `TKT-${1000 + seq}`,
      subject: t.subject,
      description: t.messages[0][1],
      category: t.category,
      priority: t.priority,
      status: t.status,
      customerId: customer._id,
      assignedAgentId: agent ? agent._id : null,
      createdAt,
    });

    const messageDocs = t.messages.map(([role, text, minutes]) => ({
      ticketId: ticket._id,
      senderId: role === 'agent' ? agent._id : customer._id,
      senderRole: role,
      message: text,
      createdAt: new Date(createdAt.getTime() + minutes * MINUTE),
    }));
    await Message.insertMany(messageDocs);
    messageCount += messageDocs.length;

    const noteDocs = t.notes.map(([text, minutes]) => ({
      ticketId: ticket._id,
      agentId: agent._id,
      note: text,
      createdAt: new Date(createdAt.getTime() + minutes * MINUTE),
    }));
    await InternalNote.insertMany(noteDocs);
    noteCount += noteDocs.length;
  }

  console.log(
    `Seeded ${createdUsers.length} users, ${tickets.length} tickets, ${messageCount} messages, ${noteCount} notes.`
  );
  console.log(`Demo password for all users: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});