/**
 * @script seed
 * @description Idempotent seed script — safe to run multiple times.
 *
 * What it does:
 *   1. Connects to MongoDB (using cached connection logic).
 *   2. Upserts the first admin account from env vars.
 *   3. Upserts sample teachers (Mukth platform teachers).
 *
 * Usage:
 *   cd server && npm run seed
 *   — or from project root —
 *   npm run seed
 *
 * Environment variables used (from server/.env):
 *   MONGO_URI | MONGODB_URI
 *   ADMIN_EMAIL    (default: admin@mukth.com)
 *   ADMIN_PASSWORD (default: AdminMukth@2025)
 */
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

// ── Load server/.env explicitly ──────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User      from '../models/User.js';
import connectDB from '../config/database.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const hash  = (p) => bcrypt.hash(p, 12);
const upsert = async (Model, filter, doc) => {
  const result = await Model.findOneAndUpdate(
    filter,
    { $setOnInsert: doc },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return result;
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_TEACHERS = [
  {
    name:      'الشيخ معاذ عاشور',
    nameEn:    'Sheikh Moaz Ashour',
    email:     'moaz@mukth.com',
    password:  'Teacher@1234',
    role:      'teacher',
  },
  {
    name:      'الشيخ أحمد عرفة',
    nameEn:    'Sheikh Ahmed Arafa',
    email:     'ahmed@mukth.com',
    password:  'Teacher@1234',
    role:      'teacher',
  },
  {
    name:      'الأستاذة ملك محمد',
    nameEn:    'Ms. Malak Mohammed',
    email:     'malak@mukth.com',
    password:  'Teacher@1234',
    role:      'teacher',
  },
  {
    name:      'الشيخ محمود الحصري',
    nameEn:    'Sheikh Mahmoud Al-Hosary',
    email:     'hosary@mukth.com',
    password:  'Teacher@1234',
    role:      'teacher',
  },
  {
    name:      'الأستاذة مريم إبراهيم',
    nameEn:    'Ms. Maryam Ibrahim',
    email:     'maryam@mukth.com',
    password:  'Teacher@1234',
    role:      'teacher',
  },
  {
    name:      'الشيخ طارق عبد القادر',
    nameEn:    'Sheikh Tarek Abdelkader',
    email:     'tarek@mukth.com',
    password:  'Teacher@1234',
    role:      'teacher',
  },
  {
    name:      'الشيخ عبدالرحمن حسن',
    nameEn:    'Sheikh Abdulrahman Hassan',
    email:     'abdulrahman@mukth.com',
    password:  'Teacher@1234',
    role:      'teacher',
  },
  {
    name:      'الأستاذة فاطمة الزهراء',
    nameEn:    'Ms. Fatima Al-Zahra',
    email:     'fatima@mukth.com',
    password:  'Teacher@1234',
    role:      'teacher',
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
const seed = async () => {
  console.log('\n🌱  Starting Mukth seed script...\n');

  try {
    // 1. Connect
    await connectDB();

    // Wait for ready state
    let retries = 0;
    while (mongoose.connection.readyState !== 1 && retries < 15) {
      await new Promise(r => setTimeout(r, 500));
      retries++;
    }
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection timed out during seeding.');
    }
    console.log('✅  Connected to MongoDB Atlas\n');

    // ── 2. Admin account ──────────────────────────────────────────────────
    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@mukth.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminMukth@2025';
    const adminHash     = await hash(adminPassword);

    const adminExists = await User.findOne({ role: 'admin' }).lean();
    if (adminExists) {
      console.log(`ℹ️   Admin already exists: ${adminExists.email} — skipping.`);
    } else {
      await User.create({
        name:         'مشرف النظام',
        nameEn:       'Super Admin',
        email:        adminEmail,
        passwordHash: adminHash,
        role:         'admin',
        isApproved:   true,
        status:       'active',
      });
      console.log('✅  Admin created:');
      console.log(`    📧 Email   : ${adminEmail}`);
      console.log(`    🔑 Password: ${adminPassword}`);
      console.log('    ⚠️  Change password after first login!\n');
    }

    // ── 3. Seed teachers ──────────────────────────────────────────────────
    console.log('🎓  Seeding teachers...');
    for (const tea of SEED_TEACHERS) {
      const exists = await User.findOne({ email: tea.email }).lean();
      if (exists) {
        console.log(`    ℹ️  Teacher exists: ${tea.email} — skipping.`);
        continue;
      }
      const passwordHash = await hash(tea.password);
      await User.create({
        name:         tea.name,
        nameEn:       tea.nameEn,
        email:        tea.email,
        passwordHash,
        role:         'teacher',
        isApproved:   true,
        status:       'active',
      });
      console.log(`    ✅ ${tea.name} (${tea.email})`);
    }

    console.log('\n🌟  Seed Complete!\n');
    console.log('─────────────────────────────────────────────');
    console.log('  Admin login:');
    console.log(`  Email   : ${process.env.ADMIN_EMAIL    || 'admin@mukth.com'}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'AdminMukth@2025'}`);
    console.log('─────────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
};

seed();
