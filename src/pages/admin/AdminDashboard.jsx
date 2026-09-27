// ── Admin Dashboard — Bookings Management + meetLink ─────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { useT, useLocale } from '../../lib/i18n';
import { adminApi } from '../../lib/api';
import { useBookingStore } from '../../stores/bookingStore';
import { C } from '../../components/shared/tokens';
import Card, { StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import apiClient from '../../lib/apiClient';

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_MAP = {
  pending:   { label: 'معلق',     labelEn: 'Pending',   color: '#d97706', bg: '#fef3c7' },
  contacted: { label: 'تم التواصل', labelEn: 'Contacted', color: '#2563eb', bg: '#dbeafe' },
  confirmed: { label: 'مؤكد',     labelEn: 'Confirmed', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'ملغى',     labelEn: 'Cancelled', color: '#dc2626', bg: '#fee2e2' },
};

// ── MeetLink Modal ────────────────────────────────────────────────────────────
function MeetLinkModal({ user, onClose, onSave }) {
  const [link, setLink] = useState(user.meetLink || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/users/${user._id}`, { meetLink: link });
      onSave(user._id, link);
      onClose();
    } catch (e) {
      alert('فشل الحفظ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: '1rem', padding: '2rem',
        width: '440px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'" }}>
          🔗 رابط الاجتماع — {user.name}
        </h3>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://meet.google.com/..."
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: '0.65rem',
            border: '1.5px solid var(--border-secondary)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
            marginBottom: '1rem', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '0.55rem 1.2rem', borderRadius: '0.55rem',
            border: '1px solid var(--border-secondary)', background: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem',
          }}>إلغاء</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '0.55rem 1.2rem', borderRadius: '0.55rem',
            background: C.g700, color: '#fff', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 700,
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ الرابط'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const locale = useLocale();
  const t = useT();

  const { bookings, fetchBookings, updateBookingStatus, loading } = useBookingStore();
  const [stats, setStats] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [meetModal, setMeetModal] = useState(null); // { _id, name, meetLink }
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
    adminApi.getDashboard().then(setStats).catch(() => {});
    adminApi.getUsers({ role: 'teacher' }).then((d) => setTeachers(Array.isArray(d) ? d : [])).catch(() => {});
  }, [fetchBookings]);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  }, [updateBookingStatus]);

  const handleMeetLinkSaved = (userId, newLink) => {
    setTeachers((prev) => prev.map((t) => t._id === userId ? { ...t, meetLink: newLink } : t));
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  const counts = {
    pending:   bookings.filter((b) => b.status === 'pending').length,
    contacted: bookings.filter((b) => b.status === 'contacted').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)',
          fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem',
        }}>
          📊 لوحة تحكم الإدارة
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          {locale === 'ar' ? 'إدارة الحجوزات والمعلمين' : 'Manage bookings & teachers'}
        </p>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon="📋" label="إجمالي الحجوزات" value={bookings.length}  color={C.g700} />
        <StatCard icon="⏳" label="معلق"             value={counts.pending}  color="#d97706" />
        <StatCard icon="📞" label="تم التواصل"       value={counts.contacted} color="#2563eb" />
        <StatCard icon="✅" label="مؤكد"             value={counts.confirmed} color="#16a34a" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem', alignItems: 'start' }}>

        {/* ── Bookings Table ─────────────────────────────────────────────── */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              📩 طلبات الحجز
            </h3>
            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['all', 'pending', 'contacted', 'confirmed', 'cancelled'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '0.3rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600,
                  border: '1.5px solid',
                  borderColor: statusFilter === s ? C.g700 : 'var(--border-secondary)',
                  background: statusFilter === s ? C.g700 : 'transparent',
                  color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {s === 'all' ? 'الكل' : (STATUS_MAP[s]?.label || s)}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
              جارٍ التحميل...
            </div>
          )}

          {!loading && filteredBookings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>
              لا توجد حجوزات في هذا التصنيف
            </div>
          )}

          {filteredBookings.map((booking) => {
            const st = STATUS_MAP[booking.status] || STATUS_MAP.pending;
            return (
              <div key={booking._id} style={{
                padding: '1rem', borderRadius: '0.75rem',
                border: '1px solid var(--border-secondary)',
                background: 'var(--bg-tertiary)', marginBottom: '0.75rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {booking.studentName}
                    </span>
                    <span style={{
                      marginInlineStart: '0.5rem', fontSize: '0.72rem', fontWeight: 700,
                      color: '#6b7280', background: '#f3f4f6',
                      padding: '0.1rem 0.5rem', borderRadius: '0.35rem',
                    }}>
                      {booking.bookingRef}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.73rem', fontWeight: 700, padding: '0.2rem 0.7rem',
                    borderRadius: '2rem', color: st.color, background: st.bg,
                  }}>
                    {st.label}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span>📱 {booking.phone}</span>
                  <span>📚 {booking.curriculum}</span>
                  {booking.teacherName && <span>🎓 {booking.teacherName}</span>}
                  <span>⏱️ {booking.plan?.sessions} حصص — {booking.plan?.durationMins} د</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Status Selector */}
                  <select
                    value={booking.status}
                    disabled={updatingId === booking._id}
                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                    style={{
                      padding: '0.35rem 0.65rem', borderRadius: '0.5rem', fontSize: '0.78rem',
                      border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', cursor: 'pointer',
                    }}
                  >
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>

                  {/* WhatsApp Button */}
                  <a
                    href={booking.waLink}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      padding: '0.35rem 0.85rem', borderRadius: '0.5rem',
                      background: '#25D366', color: '#fff', fontSize: '0.76rem',
                      fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    <span>💬</span> واتساب
                  </a>

                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginInlineStart: 'auto' }}>
                    {new Date(booking.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            );
          })}
        </Card>

        {/* ── Teachers Panel ─────────────────────────────────────────────── */}
        <Card>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            🎓 المعلمون — روابط الاجتماع
          </h3>

          {teachers.length === 0 && (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
              لا يوجد معلمون حتى الآن
            </p>
          )}

          {teachers.map((teacher) => (
            <div key={teacher._id} style={{
              padding: '0.85rem', borderRadius: '0.65rem',
              border: '1px solid var(--border-secondary)',
              background: 'var(--bg-tertiary)', marginBottom: '0.65rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.g800}, ${C.g600})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '1rem', flexShrink: 0,
              }}>
                🎓
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {teacher.name}
                </div>
                {teacher.meetLink ? (
                  <a href={teacher.meetLink} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: '0.72rem', color: C.g700, fontWeight: 600,
                    textDecoration: 'none', display: 'block',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    🔗 {teacher.meetLink}
                  </a>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    لم يُضبط رابط بعد
                  </span>
                )}
              </div>
              <button
                onClick={() => setMeetModal(teacher)}
                style={{
                  padding: '0.35rem 0.65rem', borderRadius: '0.5rem',
                  background: `${C.g700}15`, border: `1px solid ${C.g700}30`,
                  color: C.g700, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {teacher.meetLink ? 'تعديل' : 'إضافة'}
              </button>
            </div>
          ))}
        </Card>
      </div>

      {/* MeetLink Modal */}
      {meetModal && (
        <MeetLinkModal
          user={meetModal}
          onClose={() => setMeetModal(null)}
          onSave={handleMeetLinkSaved}
        />
      )}
    </div>
  );
}
