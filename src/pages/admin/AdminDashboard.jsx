// ── Admin Dashboard — System-wide analytics ─────────────────────────────────
import { useState, useEffect } from 'react';
import { useT, useLocale } from '../../lib/i18n';
import { adminApi } from '../../lib/api';
import { useSessionStore } from '../../stores/sessionStore';
import { C } from '../../components/shared/tokens';
import Card, { StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';


export default function AdminDashboard() {
  const t = useT();
  const locale = useLocale();
  const [data, setData] = useState(null);
  const { activeSessions, fetchActiveSessions } = useSessionStore();

  useEffect(() => { 
    adminApi.getDashboard().then(setData); 
    fetchActiveSessions('admin'); // Fetches all
  }, []);


  if (!data) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>{t.loading}</div>;

  const maxStudents = Math.max(...data.monthlyGrowth.map((m) => m.students));

  return (
    <div style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        📊 {t.adminDashboard}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
        {locale === 'ar' ? 'نظرة عامة على المنصة' : 'Platform overview'}
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon="👥" label={t.totalUsers} value={data.totalUsers} change={15} color={C.g700} />
        <StatCard icon="📖" label={t.activeStudents} value={data.activeStudents} change={12} color={C.goldD} />
        <StatCard icon="🎓" label={t.activeTeachers} value={data.activeTeachers} change={5} color="#4338ca" />
        <StatCard icon="📅" label={t.totalHalaqat} value={data.totalHalaqat} change={8} color="#dc2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Growth Chart */}
        <Card>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>
            📈 {locale === 'ar' ? 'نمو الطلاب الشهري' : 'Monthly Student Growth'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '180px' }}>
            {data.monthlyGrowth.map((m) => {
              const h = (m.students / maxStudents) * 100;
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.gold }}>{m.students}</span>
                  <div style={{
                    width: '100%', height: `${h}%`, minHeight: '8px',
                    borderRadius: '6px 6px 2px 2px',
                    background: `linear-gradient(180deg, ${C.gold} 0%, ${C.g600} 100%)`,
                    transition: 'height 0.5s ease',
                  }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {locale === 'ar' ? m.monthAr : m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Curriculum Distribution */}
        <Card>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>
            📊 {locale === 'ar' ? 'توزيع المناهج' : 'Curriculum Distribution'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.curriculumDistribution.map((c) => {
              const colors = [C.g600, C.goldD, '#4338ca', '#dc2626'];
              const idx = data.curriculumDistribution.indexOf(c);
              return (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {locale === 'ar' ? c.name : c.nameEn}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: colors[idx] }}>
                      {c.count} ({c.pct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border-secondary)' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px',
                      background: colors[idx],
                      width: `${c.pct}%`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live Sessions Monitor */}
        {activeSessions.length > 0 && (
          <Card style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                📡 {locale === 'ar' ? 'مراقبة الحلقات المباشرة' : 'Live Sessions Monitor'}
              </h3>
              <Badge variant="active">{activeSessions.length} {locale === 'ar' ? 'نشط' : 'Active'}</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {activeSessions.map((s) => (
                <div key={s.id} style={{
                  padding: '0.85rem', borderRadius: '0.65rem',
                  border: '1px solid var(--border-secondary)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'var(--bg-tertiary)',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', color: '#fff',
                  }}>
                    🎓
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.halaqat?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {locale === 'ar' ? `المعلم: ${s.profiles?.name}` : `Teacher: ${s.profiles?.name}`}
                    </div>
                  </div>
                  <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" style={{
                    padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: C.g800, color: '#fff', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none'
                  }}>
                    {locale === 'ar' ? 'متابعة' : 'Join'}
                  </a>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
            🕐 {locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.recentActivity.map((act, i) => {
              const icons = { registration: '👤', recording: '🎙️', review: '📋', badge: '🏆', halqa: '📅' };
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.85rem', borderRadius: '0.55rem',
                  background: 'var(--bg-tertiary)',
                }}>
                  <span style={{ fontSize: '1.15rem' }}>{icons[act.type] || '📌'}</span>
                  <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? act.name : act.name} {locale === 'ar' ? 'سجل معنا' : 'joined us'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Registration Leads */}
        <Card>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1.25rem' }}>
            📩 {locale === 'ar' ? 'طلبات التسجيل الجديدة' : 'New Registration Leads'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data.recentLeads || []).map((lead) => (
              <div key={lead._id} style={{
                padding: '1rem', borderRadius: '0.75rem',
                border: '1px solid var(--border-secondary)',
                background: 'var(--bg-tertiary)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{lead.name}</span>
                  <Badge variant={lead.status === 'new' ? 'active' : 'inactive'}>
                    {lead.status === 'new' ? (locale === 'ar' ? 'جديد' : 'New') : lead.status}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.8rem', color: C.g700, fontWeight: 600, marginBottom: '0.4rem' }}>
                  📞 {lead.phone}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {lead.curriculum && <div>📚 {lead.curriculum}</div>}
                  {lead.customPlan && (
                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.4rem', borderRadius: '0.4rem', marginTop: '0.4rem' }}>
                      ⚙️ {lead.customPlan.days} أيام/أسبوع - {lead.customPlan.mins} دقيقة
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.6rem', textAlign: 'left' }}>
                  {new Date(lead.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
              </div>
            ))}
            {(!data.recentLeads || data.recentLeads.length === 0) && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                {locale === 'ar' ? 'لا توجد طلبات جديدة حالياً' : 'No new leads at the moment'}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
