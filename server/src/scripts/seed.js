/**
 * @script seed
 * @description Populates MongoDB with initial data. Uses unified connection logic.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import User     from '../models/User.js';
import Halaqa   from '../models/Halaqa.js';
import Badge    from '../models/Badge.js';
import { BADGE_CATALOG } from '../services/gamificationService.js';
import connectDB from '../config/database.js';

const hash = (p) => bcrypt.hash(p, 12);
const seed = async () => {
  console.log('\n🌱  Starting Mukth seed script...');

  try {
    await connectDB();
    
    // Wait for connection to stabilize
    let retries = 0;
    while (mongoose.connection.readyState !== 1 && retries < 10) {
      await new Promise(r => setTimeout(r, 500));
      retries++;
    }

    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection timed out during seeding.');
    }
    console.log('✅  Connected to MongoDB');

    // 1. Badges
    await Badge.deleteMany({});
    await Badge.insertMany(BADGE_CATALOG);
    console.log('✅  Seeded badges');

    // 2. Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mukth.com';
    const adminPass  = await hash(process.env.ADMIN_PASSWORD || 'AdminPass@123');
    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        $setOnInsert: {
          name: 'مشرف النظام', nameEn: 'Super Admin',
          email: adminEmail, passwordHash: adminPass,
          role: 'admin', isApproved: true,
        },
      },
      { upsert: true }
    );
    console.log(`✅  Admin: ${adminEmail}`);

    console.log('\n🌟  Seed Complete!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
