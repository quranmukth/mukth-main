// ── Review Queue + Audio Review with Timestamped Feedback ────────────────────
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useT, useLocale } from '../../lib/i18n';
import { useNotificationStore } from '../../stores/notificationStore';
import { teacherApi } from '../../lib/api';
import { C } from '../../components/shared/tokens';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const TAJWEED_TYPES = [
  { id: 'ghunnah', label: 'غنة', labelEn: 'Ghunnah', color: '#059669' },
  { id: 'madd', label: 'مد', labelEn: 'Madd', color: '#d97706' },
  { id: 'idgham', label: 'إدغام', labelEn: 'Idgham', color: '#4338ca' },
  { id: 'ikhfa', label: 'إخفاء', labelEn: 'Ikhfa', color: '#dc2626' },
  { id: 'qalqalah', label: 'قلقلة', labelEn: 'Qalqalah', color: '#9333ea' },
  { id: 'iqlab', label: 'إقلاب', labelEn: 'Iqlab', color: '#0891b2' },
];

export default function ReviewQueue() {
  const t = useT();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const notify = useNotificationStore();
  const [selected, setSelected] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [newMarkerType, setNewMarkerType] = useState('ghunnah');
  const [newMarkerNote, setNewMarkerNote] = useState('');
  const [newMarkerTime, setNewMarkerTime] = useState(0);
  const [playProgress, setPlayProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const { reviewQueue: queue, fetchDashboard, loading } = useTeacherStore();

  useEffect(() => {
    if (user?.id) {
      fetchDashboard(user.id);
    }
  }, [user?.id, fetchDashboard]);


  const openReview = (rec) => {
    setSelected(rec);
    setMarkers(rec.feedback?.markers || []);
    setRating(rec.feedback?.rating || 0);
    setNotes(rec.feedback?.notes || '');
    setPlayProgress(0);
  };

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setPlayProgress((p) => {
          if (p >= (selected?.duration || 180)) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    }
  };

  const addMarker = () => {
    if (!newMarkerNote.trim()) return;
    setMarkers((m) => [...m, { time: playProgress, type: newMarkerType, note: newMarkerNote }].sort((a, b) => a.time - b.time));
    setNewMarkerNote('');
  };

  const submitReviewAction = useTeacherStore((s) => s.submitReview);

  const submitReview = async () => {
    if (rating === 0) {
      notify.warning(locale === 'ar' ? 'تنبيه' : 'Warning', locale === 'ar' ? 'أضف تقييم أولاً' : 'Add a rating first');
      return;
    }
    await submitReviewAction(selected.id, { rating, notes, markers, teacher_id: user.id });
    notify.success(locale === 'ar' ? 'تم!' : 'Done!', locale === 'ar' ? 'تم إرسال المراجعة بنجاح' : 'Review submitted successfully');
    setSelected(null);
    clearInterval(intervalRef.current);
    setIsPlaying(false);
  };


  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        📋 {t.reviewQueue}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {locale === 'ar' ? `${queue.length} تسجيل في الانتظار` : `${queue.length} recordings pending`}
      </p>

      {/* Queue list */}
      {queue.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {locale === 'ar' ? 'لا توجد تسجيلات معلقة. أحسنت!' : 'No pending recordings. Well done!'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {queue.map((rec) => (
            <Card key={rec.id} hover onClick={() => openReview(rec)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: `${C.g800}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', flexShrink: 0,
              }}>🎙️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {rec.profiles?.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {rec.surah_name} — {locale === 'ar' ? 'آيات' : 'Ayahs'} {rec.ayah_range}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                  {formatTime(rec.duration)} · {new Date(rec.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
              </div>
              <Button variant="outline" size="sm">{locale === 'ar' ? 'مراجعة' : 'Review'} ←</Button>
            </Card>
          ))}
        </div>
      )}

      {/* Audio Review Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); clearInterval(intervalRef.current); setIsPlaying(false); }}
        title={`${locale === 'ar' ? 'مراجعة تسجيل' : 'Review Recording'} — ${selected?.profiles?.name || ''}`}
        subtitle={`${selected?.surah_name || ''} (${locale === 'ar' ? 'آيات' : 'Ayahs'} ${selected?.ayah_range || ''})`}
        size="lg"
      >
        {/* Waveform / Progress */}
        <div style={{
          height: '70px', borderRadius: '0.65rem', marginBottom: '0.75rem',
          background: `linear-gradient(135deg, ${C.g900}, ${C.g850})`,
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setPlayProgress(Math.floor(pct * (selected?.duration || 180)));
        }}
        >
          {/* Fake waveform bars */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: '1px', padding: '8px 4px' }}>
            {Array.from({ length: 80 }, (_, i) => {
              const h = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 20;
              const played = (i / 80) <= (playProgress / (selected?.duration || 180));
              return (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: '1px',
                  background: played ? C.gold : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.1s',
                }} />
              );
            })}
          </div>
          {/* Markers on waveform */}
          {markers.map((m, i) => {
            const pct = (m.time / (selected?.duration || 180)) * 100;
            const tj = TAJWEED_TYPES.find((t) => t.id === m.type);
            return (
              <div key={i} style={{
                position: 'absolute', top: '2px', left: `${pct}%`,
                width: '3px', height: '100%', background: `${tj?.color || C.gold}88`,
                zIndex: 2,
              }} title={m.note} />
            );
          })}
        </div>

        {/* Playback controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Button variant={isPlaying ? 'outline' : 'primary'} size="sm" onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'} {isPlaying ? (locale === 'ar' ? 'إيقاف' : 'Pause') : (locale === 'ar' ? 'تشغيل' : 'Play')}
          </Button>
          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
            {formatTime(playProgress)} / {formatTime(selected?.duration || 0)}
          </span>
        </div>

        {/* Add marker */}
        <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            ➕ {t.addFeedback} @ {formatTime(playProgress)}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
            {TAJWEED_TYPES.map((tj) => (
              <button
                key={tj.id}
                onClick={() => setNewMarkerType(tj.id)}
                style={{
                  padding: '0.3rem 0.65rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600,
                  background: newMarkerType === tj.id ? tj.color : 'var(--bg-tertiary)',
                  color: newMarkerType === tj.id ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${newMarkerType === tj.id ? tj.color : 'var(--border-secondary)'}`,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {locale === 'ar' ? tj.label : tj.labelEn}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder={locale === 'ar' ? 'أضف ملاحظة...' : 'Add note...'}
              value={newMarkerNote}
              onChange={(e) => setNewMarkerNote(e.target.value)}
              style={{
                flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--text-primary)',
              }}
            />
            <Button variant="primary" size="sm" onClick={addMarker}>+</Button>
          </div>
        </Card>

        {/* Markers list */}
        {markers.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {t.timestampedFeedback} ({markers.length})
            </div>
            {markers.map((m, i) => {
              const tj = TAJWEED_TYPES.find((t) => t.id === m.type);
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.55rem 0.75rem', borderRadius: '0.5rem',
                  background: 'var(--bg-tertiary)', marginBottom: '0.35rem',
                  fontSize: '0.82rem',
                }}>
                  <span style={{ color: C.gold, fontWeight: 700, fontFamily: 'monospace', minWidth: '45px' }}>
                    {formatTime(m.time)}
                  </span>
                  <Badge variant="active" style={{ background: `${tj?.color}18`, color: tj?.color, border: `1px solid ${tj?.color}30` }}>
                    {locale === 'ar' ? tj?.label : tj?.labelEn}
                  </Badge>
                  <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{m.note}</span>
                  <button
                    onClick={() => setMarkers((ms) => ms.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.9rem' }}
                  >✕</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Overall rating */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t.overallRating}
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem',
                  opacity: star <= rating ? 1 : 0.3, transition: 'opacity 0.15s, transform 0.15s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = '')}
              >⭐</button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={locale === 'ar' ? 'ملاحظات عامة...' : 'General notes...'}
          rows={3}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '0.65rem',
            border: '1.5px solid var(--border-primary)', background: 'var(--bg-input)',
            fontFamily: 'inherit', fontSize: '0.88rem', color: 'var(--text-primary)',
            resize: 'vertical', marginBottom: '1rem',
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => { setSelected(null); clearInterval(intervalRef.current); setIsPlaying(false); }}>
            {t.cancel}
          </Button>
          <Button variant="gold" onClick={submitReview} icon="📤">
            {t.submitReview}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
