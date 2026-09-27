// ── Student Dashboard — Next Session + meetLink + Session Count ───────────────
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLocale } from '../../lib/i18n';
import { C } from '../../components/shared/tokens';
import Card, { StatCard } from '../../components/ui/Card';
import apiClient from '../../lib/apiClient';

// ── Countdown Timer ────────────────────────────────────────────────────────────
function CountdownToSession({ dateString }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!dateString) return;
    const target = new Date(dateString).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft('الحصة بدأت الآن 🎉'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}س ${m}د ${s}ث`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [dateString]);

  if (!dateString) return null;
  return (
    <div style={{
      fontSize: '0.82rem', color: C.gold, fontWeight: 700,
      padding: '0.4rem 0.85rem', borderRadius: '0.5rem',
      background: `${C.gold}15`, display: 'inline-block', marginTop: '0.5rem',
    }}>
      ⏳ {timeLeft}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);

  const [booking, setBooking] = useState(null);     // Latest confirmed booking
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.phone && !user?._id) { setLoading(false); return; }

    // Find this student's bookings by phone (bookings are phone-keyed for guests)
    const query = user.phone
      ? apiClient.get('/bookings', { params: { phone: user.phone } })
      : apiClient.get('/bookings', { params: { studentId: user._id } });

    query
      .then(({ data }) => {
        const all = data.bookings || [];
        setSessionCount(all.filter((b) => b.status === 'confirmed').length);
        const confirmed = all
          .filter((b) => b.status === 'confirmed')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (confirmed.length > 0) setBooking(confirmed[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id, user?.phone]);

  // ── Teacher meetLink from booking ────────────────────────────────────────
  const meetLink = booking?.teacherId?.meetLink || null;
  const teacherName = booking?.teacherName || booking?.teacherId?.name || '';

  if (loading) return <LoadingState />;

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)',
          fontFamily: "'IBM Plex Sans Arabic', sans-serif", margin: '0 0 0.25rem',
        }}>
          {locale === 'ar'
            ? `أهلاً ${user?.name || ''} 👋`
            : `Hello ${user?.name || ''} 👋`}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          {locale === 'ar' ? 'واصل رحلتك في حفظ القرآن الكريم' : 'Continue your Quran memorization journey'}
        </p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon="✅" label="حصص مؤكدة"    value={sessionCount}    color={C.g700} />
        <StatCard icon="📅" label="الحجز الأخير"  value={booking ? '✓' : '—'} color="#4338ca" />
        <StatCard icon="🔥" label="يوم مع القرآن" value="∞"              color="#dc2626" />
        <StatCard icon="🌿" label="منصة مُكث"     value="مبارك"          color={C.goldD} />
      </div>

      {/* ── Next Session Card (only if confirmed booking exists) ─────────── */}
      {booking ? (
        <Card style={{
          marginBottom: '1.5rem',
          background: `linear-gradient(135deg, ${C.g900}, ${C.g850})`,
          border: `1px solid ${C.gold}25`,
          color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: C.gold, fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                ✦ {locale === 'ar' ? 'حصتك القادمة مع معلمك' : 'Your upcoming session'}
              </div>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', fontWeight: 800, fontFamily: "'IBM Plex Sans Arabic'" }}>
                🎓 {teacherName || (locale === 'ar' ? 'المعلم المخصص' : 'Your Teacher')}
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
                📚 {booking.curriculum}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
                ⏱️ {booking.plan?.sessions} حصص شهرياً — {booking.plan?.durationMins} دقيقة/حصة
              </div>
              <div style={{ fontSize: '0.72rem', color: `${C.goldL}80`, marginTop: '0.4rem' }}>
                🔖 {booking.bookingRef}
              </div>
            </div>

            {/* Join Link */}
            {meetLink ? (
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                id="student-join-session-btn"
                style={{
                  padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                  background: `linear-gradient(135deg, ${C.g700}, ${C.g600})`,
                  color: '#fff', fontWeight: 800, textDecoration: 'none',
                  fontSize: '0.9rem', boxShadow: `0 6px 20px ${C.g700}50`,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'transform 0.15s',
                  flexShrink: 0,
                }}
              >
                🚀 {locale === 'ar' ? 'انضم للحصة' : 'Join Session'}
              </a>
            ) : (
              <div style={{
                padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.07)', border: '1px dashed rgba(255,255,255,0.2)',
                fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', flexShrink: 0,
                textAlign: 'center',
              }}>
                {locale === 'ar' ? '⏳ سيُحدَّد الرابط قريباً' : '⏳ Link coming soon'}
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* ── No booking yet ─── */
        <Card style={{
          marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem',
          background: `${C.g700}08`, border: `1px dashed ${C.g700}30`,
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📖</div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'" }}>
            {locale === 'ar' ? 'لم يتم تأكيد حجزك بعد' : 'No confirmed booking yet'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {locale === 'ar'
              ? 'سيتواصل معك فريقنا قريباً لتأكيد الحجز وتحديد موعد الحصة الأولى.'
              : 'Our team will contact you soon to confirm your booking and schedule your first session.'}
          </p>
        </Card>
      )}

      {/* ── Quran Inspiration Card ─────────────────────────────────────── */}
      <Card style={{
        background: `linear-gradient(135deg, ${C.g850}, ${C.g900})`,
        border: `1px solid ${C.gold}20`,
        color: '#fff',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '0.72rem', color: C.gold, fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.08em' }}>
            ✦ آية اليوم
          </div>
          <p style={{
            fontFamily: "'Amiri', serif", fontSize: '1.3rem',
            color: `${C.goldL}`, lineHeight: 2.4, marginBottom: '0.5rem', textAlign: 'center',
          }}>
            ﴿ وَقُرْآنًا فَرَّقْنَاهُ لِتَقْرَأَهُ عَلَى النَّاسِ عَلَىٰ مُكْثٍ ﴾
          </p>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            سورة الإسراء — آية 106
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Loading state ──────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="btn-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل...</p>
      </div>
    </div>
  );
}
