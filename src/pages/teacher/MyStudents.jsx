// ── My Students — Teacher's student roster ───────────────────────────────────
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLocale } from '../../lib/i18n';
import { teacherApi } from '../../lib/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';

export default function MyStudents() {
  const t = useT();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (user?.id) {
      teacherApi.getStudents(user.id).then(setStudents);
    }
  }, [user?.id]);


  const columns = [
    {
      header: locale === 'ar' ? 'الطالب' : 'Student',
      accessor: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: '#065f46', flexShrink: 0,
          }}>
            {(locale === 'ar' ? row.name : row.nameEn)?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{locale === 'ar' ? row.name : row.nameEn}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { header: locale === 'ar' ? 'المنهج' : 'Curriculum', accessor: 'curriculum' },
    { header: locale === 'ar' ? 'الإتقان' : 'Accuracy', accessor: 'accuracy', render: (row) => <span style={{ fontWeight: 700, color: row.accuracy >= 90 ? '#059669' : '#d97706' }}>{row.accuracy}%</span> },
    { header: locale === 'ar' ? 'سلسلة' : 'Streak', accessor: 'streak', render: (row) => <span>🔥 {row.streak} {locale === 'ar' ? 'يوم' : 'days'}</span> },
    {
      header: locale === 'ar' ? 'الحالة' : 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status} dot>{locale === 'ar' ? (row.status === 'active' ? 'نشط' : 'غير نشط') : row.status}</Badge>,
    },
  ];

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        👥 {t.myStudents}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {locale === 'ar' ? `${students.length} طالب مسجل` : `${students.length} enrolled students`}
      </p>

      <Card>
        <Table
          columns={columns}
          data={students}
          searchable
          searchPlaceholder={locale === 'ar' ? 'ابحث عن طالب...' : 'Search students...'}
          emptyMessage={locale === 'ar' ? 'لا يوجد طلاب' : 'No students found'}
        />
      </Card>
    </div>
  );
}
