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

// ── Egypt DNS Hack ───────────────────────────────────────────────────────────
setServers(['8.8.8.8', '8.8.4.4']);

const hash = (p) => bcrypt.hash(p, 12);

const ARABIC_NAMES = ['محمد أحمد', 'عبد الله علي', 'يوسف إبراهيم', 'أحمد محمود', 'عمر خالد'];
const EN_NAMES = ['Mohammed Ahmed', 'Abdullah Ali', 'Yusuf Ibrahim', 'Ahmad Mahmoud', 'Omar Khalid'];
const CURRICULA = ['حفظ', 'مراجعة', 'تجويد'];

const seed = async () => {
  console.log('\n🌱  Starting Mukth seed script...');

  const uri = process.env.MONGODB_URI;
  if (uri.startsWith('mongodb+srv://')) {
    console.warn('⚠️  Warning: Using +srv. In Egypt, use standard mongodb:// if this fails.');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
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
