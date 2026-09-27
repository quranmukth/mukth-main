/**
 * @component RegisterModal
 * @description "ابدأ الآن" full flow:
 *   Step 1 — Collect name, phone, curriculum, plan
 *   Step 2 — Create account (email + password) or login if existing
 *   Step 3 — Create booking record → open WhatsApp with booking ref #MKT-XXXX
 */
import { useState, useEffect } from 'react';
import { C } from './tokens';
import { useLocale } from '../../lib/i18n';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../lib/apiClient';

const CURRICULA_AR = ['حفظ القرآن للأطفال', 'حفظ القرآن للكبار', 'إجازة القرآن الكريم', 'تجويد وتلاوة'];
const CURRICULA_EN = ['Quran for Kids', 'Quran for Adults', 'Quran Ijazah', 'Tajweed & Recitation'];

const PLANS = [
  { sessions: 8,  durationMins: 30, label: '8 حصص شهرياً',  labelEn: '8 sessions/mo'  },
  { sessions: 12, durationMins: 45, label: '12 حصة شهرياً', labelEn: '12 sessions/mo' },
  { sessions: 20, durationMins: 60, label: '20 حصة شهرياً', labelEn: '20 sessions/mo' },
];

export default function RegisterModal({ isOpen, onClose, defaultPlan }) {
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const registerFn = useAuthStore((s) => s.register);
  const loginFn    = useAuthStore((s) => s.login);
  const currentUser = useAuthStore((s) => s.user);

  // step: 'info' | 'account' | 'loading' | 'success' | 'error'
  const [step, setStep]             = useState('info');
  const [authMode, setAuthMode]     = useState('register'); // 'register' | 'login'
  const [errorMsg, setErrorMsg]     = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  const CURRICULA = locale === 'ar' ? CURRICULA_AR : CURRICULA_EN;

  const [info, setInfo] = useState({
    name: '',
    phone: '',
    curriculum: CURRICULA_AR[0],
    plan: defaultPlan || PLANS[0],
  });

  const [account, setAccount] = useState({ email: '', password: '' });

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setStep('info');
      setErrorMsg('');
      setBookingResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Booking creation ─────────────────────────────────────────────────────────
  const doBooking = async (loggedUser) => {
    setStep('loading');
    try {
      const res = await apiClient.post('/bookings', {
        studentName: loggedUser?.name || info.name,
        phone:       loggedUser?.phone || info.phone,
        curriculum:  info.curriculum,
        plan:        info.plan,
        teacherId:   null,
      });
      const { booking, waLink } = res.data;
      setBookingResult({ booking, waLink });
      setStep('success');
      // Auto-open WhatsApp
      setTimeout(() => { if (waLink) window.open(waLink, '_blank'); }, 700);
    } catch (err) {
      setErrorMsg(err.message || (locale === 'ar' ? 'فشل إنشاء الحجز' : 'Booking creation failed'));
      setStep('error');
    }
  };

  // ── Step handlers ────────────────────────────────────────────────────────────
  const handleInfoNext = () => {
    if (!info.name.trim() || !info.phone.trim()) {
      setErrorMsg(locale === 'ar' ? 'الاسم والهاتف مطلوبان' : 'Name and phone are required');
      return;
    }
    setErrorMsg('');
    if (currentUser) {
      doBooking(currentUser);
    } else {
      setStep('account');
    }
  };

  const handleAccountSubmit = async () => {
    if (!account.email.trim() || account.password.length < 6) {
      setErrorMsg(locale === 'ar' ? 'البريد وكلمة المرور (6+ أحرف) مطلوبان' : 'Email and password (6+ chars) required');
      return;
    }
    setErrorMsg('');
    setStep('loading');
    try {
      let loggedUser;
      if (authMode === 'register') {
        loggedUser = await registerFn(account.email, account.password, {
          name: info.name,
          phone: info.phone,
          role: 'student',
        });
      } else {
        loggedUser = await loginFn(account.email, account.password);
      }
      await doBooking(loggedUser || currentUser);
    } catch (err) {
      let msg = err.message || '';
      if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('DUPLICATE')) {
        msg = locale === 'ar'
          ? 'هذا البريد مسجل بالفعل — جرّب تسجيل الدخول'
          : 'Email already exists — try logging in instead';
        setAuthMode('login');
      } else if (msg.includes('Invalid email or password')) {
        msg = locale === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials';
      }
      setErrorMsg(msg);
      setStep('account');
    }
  };

  /* ── Shared styles ─────────────────────────────────────────────────────────── */
  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.65rem',
    border: `1.5px solid ${C.border}`, background: '#f8faf9',
    color: C.dark, fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
    textAlign: locale === 'ar' ? 'right' : 'left',
    direction: locale === 'ar' ? 'rtl' : 'ltr',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.84rem', fontWeight: 600,
    color: C.g800, marginBottom: '0.35rem',
    textAlign: locale === 'ar' ? 'right' : 'left',
  };

  const primaryBtn = {
    padding: '0.95rem', borderRadius: '0.8rem',
    background: `linear-gradient(135deg, ${C.g800}, ${C.g700})`,
    color: '#fff', fontWeight: 800, fontSize: '1rem',
    border: 'none', cursor: 'pointer', width: '100%',
    fontFamily: 'inherit',
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(1,26,18,0.88)',
        backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', direction: dir,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '1.5rem', padding: '2.5rem',
        width: '100%', maxWidth: '480px',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: `0 28px 80px rgba(1,26,18,0.5), 0 0 0 1px ${C.gold}28`,
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: C.gold, fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
              {step === 'success' ? '✅ ' : step === 'account' ? '🔐 ' : '🌿 '}
              {locale === 'ar' ? 'منصة مُكث' : 'MUKTH PLATFORM'}
            </p>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.g800, margin: 0, fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic'" : "'Inter'" }}>
              {step === 'success'
                ? (locale === 'ar' ? 'تم تسجيل حجزك! 🎉' : 'Booking Confirmed! 🎉')
                : step === 'account'
                  ? (authMode === 'register'
                    ? (locale === 'ar' ? 'إنشاء حساب' : 'Create Account')
                    : (locale === 'ar' ? 'تسجيل الدخول' : 'Log In'))
                  : (locale === 'ar' ? 'ابدأ رحلتك مع القرآن' : 'Start Your Quran Journey')}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer',
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', color: C.muted, flexShrink: 0,
          }}>✕</button>
        </div>

        {/* ── Error Banner ── */}
        {errorMsg && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
            padding: '0.75rem 1rem', borderRadius: '0.65rem', marginBottom: '1rem',
            fontSize: '0.85rem', fontWeight: 600,
            textAlign: locale === 'ar' ? 'right' : 'left',
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ── Loading ── */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              border: `3px solid ${C.gold}30`, borderTopColor: C.gold,
              animation: 'spin 1s linear infinite', margin: '0 auto 1.25rem',
            }} />
            <p style={{ color: C.muted }}>{locale === 'ar' ? 'جارٍ المعالجة...' : 'Processing...'}</p>
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && bookingResult && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '2rem',
            }}>🌿</div>
            <h3 style={{ color: C.g800, fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic'" : "'Inter'" }}>
              {locale === 'ar' ? 'تم تسجيل حجزك بنجاح!' : 'Booking registered successfully!'}
            </h3>
            <p style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {locale === 'ar'
                ? `رقم الحجز: ${bookingResult.booking?.bookingRef}\nسيتواصل معك فريقنا عبر واتساب قريباً.`
                : `Ref: ${bookingResult.booking?.bookingRef} — Our team will WhatsApp you soon.`}
            </p>
            <a
              href={bookingResult.waLink}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-block', padding: '0.85rem 2rem', borderRadius: '0.8rem',
                background: '#25D366', color: '#fff', fontWeight: 800, fontSize: '1rem',
                textDecoration: 'none', marginBottom: '0.75rem',
              }}
            >
              💬 {locale === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
            </a>
            <br />
            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', color: C.muted,
              cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem',
            }}>
              {locale === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        )}

        {/* ── Error state ── */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <p style={{ color: C.muted, marginBottom: '1.5rem' }}>
              {locale === 'ar' ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.'}
            </p>
            <button onClick={() => { setStep('info'); setErrorMsg(''); }} style={primaryBtn}>
              {locale === 'ar' ? '← رجوع' : '← Go Back'}
            </button>
          </div>
        )}

        {/* ── Step 1: Info ── */}
        {step === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>{locale === 'ar' ? 'الاسم الكامل ✱' : 'Full Name ✱'}</label>
              <input
                style={inputStyle} type="text"
                placeholder={locale === 'ar' ? 'محمد أحمد' : 'John Doe'}
                value={info.name}
                onChange={(e) => setInfo((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>{locale === 'ar' ? 'رقم الهاتف ✱' : 'Phone Number ✱'}</label>
              <input
                style={inputStyle} type="tel"
                placeholder="+20 1XX XXX XXXX"
                value={info.phone}
                onChange={(e) => setInfo((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>{locale === 'ar' ? 'المنهج المطلوب' : 'Curriculum'}</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={info.curriculum}
                onChange={(e) => setInfo((f) => ({ ...f, curriculum: e.target.value }))}
              >
                {CURRICULA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{locale === 'ar' ? 'الخطة الشهرية' : 'Monthly Plan'}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {PLANS.map((p) => (
                  <button
                    key={p.sessions} type="button"
                    onClick={() => setInfo((f) => ({ ...f, plan: p }))}
                    style={{
                      flex: 1, padding: '0.6rem 0.3rem', borderRadius: '0.65rem',
                      border: `2px solid ${info.plan.sessions === p.sessions ? C.g700 : C.border}`,
                      background: info.plan.sessions === p.sessions ? `${C.g700}12` : 'transparent',
                      color: info.plan.sessions === p.sessions ? C.g700 : C.muted,
                      fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {locale === 'ar' ? p.label : p.labelEn}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleInfoNext} style={{ ...primaryBtn, marginTop: '0.25rem' }}>
              {locale === 'ar' ? 'التالي ←' : 'Next →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: C.muted, margin: 0 }}>
              🔒 {locale === 'ar' ? 'بياناتك محمية ومشفرة بالكامل' : 'Your data is fully protected'}
            </p>
          </div>
        )}

        {/* ── Step 2: Account ── */}
        {step === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: C.muted, fontSize: '0.85rem', textAlign: locale === 'ar' ? 'right' : 'left', margin: 0 }}>
              {locale === 'ar'
                ? 'أنشئ حسابك للحفاظ على حجزك ومتابعة حصصك'
                : 'Create an account to save your booking and track your sessions'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['register', 'login'].map((mode) => (
                <button
                  key={mode} type="button"
                  onClick={() => { setAuthMode(mode); setErrorMsg(''); }}
                  style={{
                    flex: 1, padding: '0.55rem', borderRadius: '0.6rem',
                    border: `2px solid ${authMode === mode ? C.g700 : C.border}`,
                    background: authMode === mode ? `${C.g700}12` : 'transparent',
                    color: authMode === mode ? C.g700 : C.muted,
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {mode === 'register'
                    ? (locale === 'ar' ? '📝 حساب جديد' : '📝 New Account')
                    : (locale === 'ar' ? '🔑 دخول' : '🔑 Login')}
                </button>
              ))}
            </div>
            <div>
              <label style={labelStyle}>{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <input
                style={inputStyle} type="email"
                placeholder="example@mukth.com"
                value={account.email}
                onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>{locale === 'ar' ? 'كلمة المرور' : 'Password'}</label>
              <input
                style={inputStyle} type="password"
                placeholder={locale === 'ar' ? '٦ أحرف على الأقل' : '6+ characters'}
                value={account.password}
                onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))}
              />
            </div>
            <button onClick={handleAccountSubmit} style={{ ...primaryBtn, marginTop: '0.25rem' }}>
              {authMode === 'register'
                ? (locale === 'ar' ? '🌿 إنشاء حساب وتأكيد الحجز' : '🌿 Create Account & Confirm Booking')
                : (locale === 'ar' ? '🔑 دخول وتأكيد الحجز' : '🔑 Login & Confirm Booking')}
            </button>
            <button
              onClick={() => setStep('info')}
              style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              {locale === 'ar' ? '← رجوع' : '← Back'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
