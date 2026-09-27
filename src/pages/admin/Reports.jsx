// ── Admin Reports Page ───────────────────────────────────────────────────────
import { useT, useLocale } from '../../lib/i18n';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function Reports() {
  const t = useT();
  const locale = useLocale();

  const reports = [
    { icon: '📖', name: locale === 'ar' ? 'تقرير تقدم الطلاب' : 'Student Progress Report', desc: locale === 'ar' ? 'ملخص شامل لتقدم جميع الطلاب' : 'Comprehensive summary of all student progress' },
    { icon: '🎓', name: locale === 'ar' ? 'تقرير أداء المعلمين' : 'Teacher Performance Report', desc: locale === 'ar' ? 'تقييمات المعلمين وإحصائياتهم' : 'Teacher ratings and statistics' },
    { icon: '📅', name: locale === 'ar' ? 'تقرير الحضور' : 'Attendance Report', desc: locale === 'ar' ? 'نسبة الحضور لجميع الحلقات' : 'Attendance rates for all halaqat' },
    { icon: '💰', name: locale === 'ar' ? 'التقرير المالي' : 'Financial Report', desc: locale === 'ar' ? 'الإيرادات والاشتراكات الشهرية' : 'Revenue and monthly subscriptions' },
  ];

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        📈 {t.reports}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {locale === 'ar' ? 'تنزيل التقارير الإدارية' : 'Download admin reports'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {reports.map((r) => (
          <Card key={r.name} hover style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '0.65rem',
              background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', flexShrink: 0,
            }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{r.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{r.desc}</div>
            </div>
            <Button variant="outline" size="sm">📥 {locale === 'ar' ? 'تنزيل' : 'Download'}</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
