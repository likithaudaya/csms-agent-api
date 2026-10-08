import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const DEMO_PASSWORD = 'Password@123';

const users = [
  { name: 'Admin User', email: 'admin@csms.com', role: 'admin' },
  { name: 'Likitha Agent', email: 'agent1@csms.com', role: 'agent' },
  { name: 'Ravi Agent', email: 'agent2@csms.com', role: 'agent' },
  { name: 'John Customer', email: 'john@example.com', role: 'customer' },
  { name: 'Priya Customer', email: 'priya@example.com', role: 'customer' },
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed in production.');
    process.exit(1);
  }

  await connectDB();

  await User.deleteMany({});

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const created = await User.insertMany(
    users.map((u) => ({ ...u, passwordHash }))
  );

  console.log(`Seeded ${created.length} users.`);
  console.log(`Demo password for all users: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});