// ── Halaqat Scheduler — Create and manage halaqat groups ─────────────────────
import { useState, useEffect } from 'react';
import { useT, useLocale } from '../../lib/i18n';
import { useNotificationStore } from '../../stores/notificationStore';
import { adminApi } from '../../lib/api';
import { C } from '../../components/shared/tokens';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function HalaqatScheduler() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const notify = useNotificationStore();
  const [halaqat, setHalaqat] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newHalqa, setNewHalqa] = useState({ name: '', curriculum: '', capacity: 8 });

  useEffect(() => { adminApi.getHalaqat().then(setHalaqat); }, []);

  const handleCreate = async () => {
    if (!newHalqa.name) {
      notify.warning(locale === 'ar' ? 'تنبيه' : 'Warning', locale === 'ar' ? 'أدخل اسم الحلقة' : 'Enter halqa name');
      return;
    }
    const result = await adminApi.createHalqa(newHalqa);
    setHalaqat((h) => [...h, result]);
    notify.success(locale === 'ar' ? 'تم!' : 'Done!', locale === 'ar' ? 'تم إنشاء الحلقة' : 'Halqa created');
    setCreateOpen(false);
    setNewHalqa({ name: '', curriculum: '', capacity: 8 });
  };

  const handleDelete = async (id) => {
    await adminApi.deleteHalqa(id);
    setHalaqat((h) => h.filter((hq) => hq.id !== id));
    notify.success(locale === 'ar' ? 'تم!' : 'Done!', locale === 'ar' ? 'تم حذف الحلقة' : 'Halqa deleted');
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
            📅 {t.halaqatScheduler}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {locale === 'ar' ? `${halaqat.length} حلقة` : `${halaqat.length} halaqat`}
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)} icon="➕">{t.createHalqa}</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {halaqat.map((hq) => (
          <Card key={hq.id} hover>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {locale === 'ar' ? hq.name : hq.nameEn || hq.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{hq.curriculum}</span>
              </div>
              <Badge variant="active" dot>{locale === 'ar' ? 'نشط' : 'Active'}</Badge>
            </div>

            {/* Capacity bar */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                <span>{t.capacity}</span>
                <span>{hq.studentIds?.length || 0}/{hq.capacity}</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-secondary)' }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  background: `linear-gradient(90deg, ${C.g600}, ${C.gold})`,
                  width: `${((hq.studentIds?.length || 0) / hq.capacity) * 100}%`,
                }} />
              </div>
            </div>

            {/* Schedule */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                📅 {t.schedule}
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {hq.schedule?.map((s, i) => (
                  <span key={i} style={{
                    padding: '0.2rem 0.55rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                    background: `${C.g600}10`, color: C.g700, border: `1px solid ${C.g600}20`,
                  }}>
                    {locale === 'ar' ? s.day : s.dayEn} {s.time}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" size="sm" style={{ flex: 1 }}> ✏️ {t.edit}</Button>
              <Button variant="ghost" size="sm" style={{ color: '#dc2626' }} onClick={() => handleDelete(hq.id)}>🗑️</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={t.createHalqa}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Input label={locale === 'ar' ? 'اسم الحلقة' : 'Halqa Name'} name="name" value={newHalqa.name}
            onChange={(e) => setNewHalqa((h) => ({ ...h, name: e.target.value }))} dir={dir} required />
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
              {locale === 'ar' ? 'المنهج' : 'Curriculum'}
            </label>
            <select
              value={newHalqa.curriculum}
              onChange={(e) => setNewHalqa((h) => ({ ...h, curriculum: e.target.value }))}
              style={{
                width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.6rem',
                border: '1.5px solid var(--border-primary)', background: 'var(--bg-input)',
                fontSize: '0.88rem', fontFamily: 'inherit', color: 'var(--text-primary)',
              }}
            >
              <option value="">{locale === 'ar' ? 'اختر...' : 'Select...'}</option>
              <option value="حفظ للأطفال">حفظ للأطفال</option>
              <option value="حفظ للكبار">حفظ للكبار</option>
              <option value="إجازة القرآن">إجازة القرآن</option>
              <option value="تجويد وتلاوة">تجويد وتلاوة</option>
            </select>
          </div>
          <Input label={t.capacity} name="capacity" type="number" value={newHalqa.capacity}
            onChange={(e) => setNewHalqa((h) => ({ ...h, capacity: parseInt(e.target.value) || 1 }))} dir={dir} />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t.cancel}</Button>
            <Button variant="primary" onClick={handleCreate} icon="✓">{t.save}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
