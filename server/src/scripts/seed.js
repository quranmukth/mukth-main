/**
 * @script seed
 * @description Populates MongoDB with initial data. Uses unified connection logic.
 */
import 'dotenv/config';
import { setServers } from 'node:dns';
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import User     from '../models/User.js';
import Halaqa   from '../models/Halaqa.js';
import Badge    from '../models/Badge.js';
import { BADGE_CATALOG } from '../services/gamificationService.js';

import connectDB from '../config/database.js';

const hash = (p) => bcrypt.hash(p, 12);

const ARABIC_NAMES = ['محمد أحمد', 'عبد الله علي', 'يوسف إبراهيم', 'أحمد محمود', 'عمر خالد'];
const EN_NAMES = ['Mohammed Ahmed', 'Abdullah Ali', 'Yusuf Ibrahim', 'Ahmad Mahmoud', 'Omar Khalid'];
const CURRICULA = ['حفظ', 'مراجعة', 'تجويد'];

const seed = async () => {
  console.log('\n🌱  Starting Mukth seed script...');

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  Error: MONGODB_URI is not defined. Ensure server/.env exists.');
    process.exit(1);
  }

  try {
    // Use the unified connection logic (with DoH bypass)
    await connectDB();
    
    // Wait a moment for the connection to be established if it's async
    if (mongoose.connection.readyState !== 1) {
        console.log('⏳ Waiting for database connection...');
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('DB Connection Timeout')), 15000);
            mongoose.connection.once('connected', () => {
                clearTimeout(timeout);
                resolve();
            });
        });
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
