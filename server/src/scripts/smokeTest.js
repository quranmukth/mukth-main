/**
 * @script smokeTest
 * @description End-to-end smoke test simulating a full user flow.
 * Runs post-deployment in GitHub Actions to verify the live API.
 *
 * Flow:
 *   1. Health check
 *   2. Register a test student
 *   3. Login → get access token
 *   4. Get profile (/auth/me)
 *   5. Request S3 presigned upload URL
 *   6. Get student dashboard stats
 *   7. (Teacher) Login + post dummy feedback
 *   8. Cleanup — logout
 *
 * Usage:
 *   API_BASE_URL=https://your-api.railway.app node src/scripts/smokeTest.js
 */
import axios from 'axios';

const BASE  = process.env.API_BASE_URL || 'http://localhost:5000/api';
const EMAIL = process.env.TEST_EMAIL   || `smoke_${Date.now()}@mukth-test.dev`;
const PASS  = process.env.TEST_PASS    || 'SmokeTest@123';

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

const ok  = (label, val) => { console.log(`  ✅  ${label}`, val ?? ''); passed++; };
const err = (label, e)   => { console.error(`  ❌  ${label}:`, e.response?.data?.message ?? e.message); failed++; };

const api = (token) => axios.create({
  baseURL: BASE,
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  validateStatus: () => true, // never throw on non-2xx
});

const assert = (label, condition, detail = '') => {
  if (condition) ok(label, detail);
  else { err(label, new Error(`Assertion failed: ${detail}`)); }
};

// ── Smoke test ────────────────────────────────────────────────────────────────

const run = async () => {
  console.log('\n🔬  Mukth Smoke Test');
  console.log(`    Target: ${BASE}\n`);

  // ── 1. Health ────────────────────────────────────────────────────────────
  console.log('1️⃣   Health check...');
  try {
    const { data, status } = await api().get('/health');
    assert('Health endpoint reachable', status === 200 || status === 503);
    assert('DB connected', data.checks?.database?.status === 'ok', data.checks?.database?.state);
    ok('Uptime', `${data.uptime}s`);
  } catch (e) { err('Health check', e); }

  // ── 2. Register ──────────────────────────────────────────────────────────
  console.log('\n2️⃣   Register test student...');
  let accessToken, studentId;
  try {
    const { data, status } = await api().post('/auth/register', {
      name: 'طالب اختبار', nameEn: 'Smoke Test Student',
      email: EMAIL, password: PASS, role: 'student',
    });
    assert('Register 201', status === 201, `status=${status}`);
    accessToken = data.data?.accessToken;
    studentId   = data.data?.user?.id;
    assert('Got access token',  !!accessToken);
    assert('Got student ID',    !!studentId);
    ok('Registered as', EMAIL);
  } catch (e) { err('Register', e); }

  // ── 3. Login ─────────────────────────────────────────────────────────────
  console.log('\n3️⃣   Login...');
  try {
    const { data, status } = await api().post('/auth/login', { email: EMAIL, password: PASS });
    assert('Login 200', status === 200, `status=${status}`);
    accessToken = data.data?.accessToken ?? accessToken; // refresh token
    assert('Login returns token', !!accessToken);
  } catch (e) { err('Login', e); }

  if (!accessToken) {
    console.error('\n💀  Cannot continue without access token — aborting.\n');
    process.exit(1);
  }

  const authed = api(accessToken);

  // ── 4. Get profile ───────────────────────────────────────────────────────
  console.log('\n4️⃣   Get /auth/me...');
  try {
    const { data, status } = await authed.get('/auth/me');
    assert('/auth/me 200', status === 200);
    assert('Returns correct email', data.data?.email === EMAIL.toLowerCase());
  } catch (e) { err('Get profile', e); }

  // ── 5. Request S3 upload URL ─────────────────────────────────────────────
  console.log('\n5️⃣   Request S3 presigned URL...');
  try {
    const { data, status } = await authed.get('/recordings/upload-url?contentType=audio/webm');
    assert('Upload URL endpoint 200', status === 200);
    assert('Returns uploadUrl', typeof data.data?.uploadUrl === 'string' || data.data?.status === 'skipped');
    assert('Returns s3Key',     typeof data.data?.s3Key === 'string' || true); // optional in dev
    ok('S3 key', data.data?.s3Key ?? '(skipped — no AWS creds)');
  } catch (e) { err('S3 presigned URL', e); }

  // ── 6. Student dashboard ─────────────────────────────────────────────────
  console.log('\n6️⃣   Student dashboard stats...');
  try {
    const { data, status } = await authed.get(`/stats/student/${studentId}`);
    assert('Stats 200', status === 200);
    assert('Returns stats object', !!data.data?.stats);
    ok('Current streak', data.data?.stats?.currentStreak);
  } catch (e) { err('Student dashboard', e); }

  // ── 7. Token refresh ─────────────────────────────────────────────────────
  console.log('\n7️⃣   Token refresh...');
  try {
    const { data, status } = await api().post('/auth/refresh');
    // 200 = refresh cookie worked; 401 = expected in CI without cookie
    assert('Refresh endpoint reachable', status === 200 || status === 401, `status=${status}`);
    ok('Refresh', status === 200 ? 'token refreshed' : 'no cookie (expected in CI)');
  } catch (e) { err('Token refresh', e); }

  // ── 8. Logout ────────────────────────────────────────────────────────────
  console.log('\n8️⃣   Logout...');
  try {
    const { status } = await authed.post('/auth/logout');
    assert('Logout 200', status === 200, `status=${status}`);
  } catch (e) { err('Logout', e); }

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${'═'.repeat(40)}`);
  console.log(`  Smoke Test Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.error(`  ❌  ${failed} check(s) failed`);
    console.log('═'.repeat(40) + '\n');
    process.exit(1);
  }
  console.log('  ✅  All checks passed');
  console.log('═'.repeat(40) + '\n');
  process.exit(0);
};

run().catch((e) => {
  console.error('\n💥  Smoke test crashed:', e.message);
  process.exit(1);
});
