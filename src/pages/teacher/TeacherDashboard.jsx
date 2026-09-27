// ── Teacher Dashboard — Sessions, Students, meetLink ──────────────────────────
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLocale } from '../../lib/i18n';
import { C } from '../../components/shared/tokens';
import Card, { StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import apiClient from '../../lib/apiClient';

// ── Inline meetLink editor ────────────────────────────────────────────────────
function MeetLinkEditor({ currentLink, userId, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(currentLink || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/users/${userId}`, { meetLink: link });
      onSaved(link);
      setEditing(false);
    } catch (e) {
      alert('فشل الحفظ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" style={{
            fontSize: '0.85rem', color: C.g700, fontWeight: 600, textDecoration: 'none',
          }}>
            🔗 {link}
          </a>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            لم يُضبط رابط الاجتماع بعد
          </span>
        )}
        <button onClick={() => setEditing(true)} style={{
          padding: '0.3rem 0.75rem', borderRadius: '0.45rem',
          background: `${C.g700}15`, border: `1px solid ${C.g700}30`,
          color: C.g700, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
        }}>
          {link ? '✏️ تعديل' : '+ إضافة رابط'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="https://meet.google.com/..."
        autoFocus
        style={{
          flex: 1, minWidth: '200px', padding: '0.4rem 0.75rem',
          borderRadius: '0.5rem', border: '1.5px solid var(--border-secondary)',
          background: 'var(--bg-secondary)', color: 'var(--text-primary)',
          fontSize: '0.85rem', outline: 'none',
        }}
      />
      <button onClick={handleSave} disabled={saving} style={{
        padding: '0.4rem 0.9rem', borderRadius: '0.5rem',
        background: C.g700, color: '#fff', border: 'none',
        cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 700,
        opacity: saving ? 0.7 : 1,
      }}>
        {saving ? '...' : 'حفظ'}
      </button>
      <button onClick={() => { setEditing(false); setLink(currentLink || ''); }} style={{
        padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
        background: 'transparent', border: '1px solid var(--border-secondary)',
        color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem',
      }}>
        إلغاء
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState([]);
  const [meetLink, setMeetLink] = useState(user?.meetLink || '');
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    setMeetLink(user.meetLink || '');

    // Fetch bookings assigned to this teacher
    apiClient.get('/bookings', { params: { teacherId: user._id } })
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, [user?._id]);

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const pendingBookings   = bookings.filter((b) => b.status === 'pending');

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)',
          fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem',
        }}>
          {locale === 'ar'
            ? `مرحباً يا شيخ ${user?.name?.split(' ')[1] || user?.name || ''} 🎓`
            : `Hello ${user?.name || 'Teacher'} 🎓`}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          {locale === 'ar' ? 'إليك نظرة عامة على نشاطك' : 'Here is your activity overview'}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon="👥" label="طلاب مؤكدين" value={confirmedBookings.length} color={C.g700} />
        <StatCard icon="⏳" label="طلبات معلقة" value={pendingBookings.length}   color="#d97706" />
        <StatCard icon="📅" label="إجمالي الحجوزات" value={bookings.length}      color="#4338ca" />
        <StatCard icon="⭐" label="التقييم"          value="4.9"                 color={C.goldD} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

        {/* ── Meet Link Card ───────────────────────────────────────────── */}
        <Card style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            🔗 رابط الاجتماع الخاص بك
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            سيُرسَل هذا الرابط للطلاب المؤكدين تلقائياً عند تأكيد حجزهم.
          </p>
          {user?._id && (
            <MeetLinkEditor
              currentLink={meetLink}
              userId={user._id}
              onSaved={(newLink) => setMeetLink(newLink)}
            />
          )}
          {meetLink && (
            <a href={meetLink} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', marginTop: '1rem',
              padding: '0.5rem 1.2rem', borderRadius: '0.6rem',
              background: C.g700, color: '#fff', fontSize: '0.85rem',
              fontWeight: 700, textDecoration: 'none',
            }}>
              🚀 اختبر الرابط
            </a>
          )}
        </Card>

        {/* ── Confirmed Students ───────────────────────────────────────── */}
        <Card>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            ✅ الطلاب المؤكدون
          </h3>
          {loadingBookings && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
              جارٍ التحميل...
            </div>
          )}
          {!loadingBookings && confirmedBookings.length === 0 && (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
              لا يوجد طلاب مؤكدون بعد
            </p>
          )}
          {confirmedBookings.map((b) => (
            <div key={b._id} style={{
              padding: '0.85rem', borderRadius: '0.65rem',
              border: '1px solid var(--border-secondary)',
              background: 'var(--bg-tertiary)', marginBottom: '0.6rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: `${C.g700}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}>
                👤
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {b.studentName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  📱 {b.phone} &nbsp;·&nbsp; 📚 {b.curriculum}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                  {b.plan?.sessions} حصص — {b.plan?.durationMins} دقيقة/حصة
                </div>
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                borderRadius: '2rem', color: '#16a34a', background: '#dcfce7',
              }}>
                مؤكد
              </span>
            </div>
          ))}
        </Card>

        {/* ── Pending Requests ─────────────────────────────────────────── */}
        <Card>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            ⏳ طلبات الحجز الجديدة
          </h3>
          {!loadingBookings && pendingBookings.length === 0 && (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
              لا توجد طلبات معلقة
            </p>
          )}
          {pendingBookings.map((b) => (
            <div key={b._id} style={{
              padding: '0.85rem', borderRadius: '0.65rem',
              border: '1px solid #fde68a',
              background: '#fffbeb', marginBottom: '0.6rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e', marginBottom: '0.3rem' }}>
                {b.studentName}
                <span style={{
                  marginInlineStart: '0.5rem', fontSize: '0.7rem', background: '#fef3c7',
                  padding: '0.1rem 0.5rem', borderRadius: '0.3rem', color: '#78350f',
                }}>
                  {b.bookingRef}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#92400e' }}>
                📱 {b.phone} &nbsp;·&nbsp; 📚 {b.curriculum}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a16207', marginTop: '0.25rem' }}>
                {new Date(b.createdAt).toLocaleDateString('ar-EG')}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
