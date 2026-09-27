// ── User Management — CRUD for all users ─────────────────────────────────────
import { useState, useEffect } from 'react';
import { useT, useLocale } from '../../lib/i18n';
import { useNotificationStore } from '../../stores/notificationStore';
import { adminApi } from '../../lib/api';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

export default function UserManagement() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const notify = useNotificationStore();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'student', password: '123456' });

  const loadUsers = async (filters = {}) => {
    try {
      const data = await adminApi.getUsers({ ...filters, role: roleFilter || undefined });
      setUsers(data);
    } catch (err) {
      notify.error('Error', err.message);
    }
  };

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const handleCreate = async () => {
    if (!newUser.name || !newUser.email) {
      notify.warning(locale === 'ar' ? 'تنبيه' : 'Warning', locale === 'ar' ? 'أكمل البيانات المطلوبة' : 'Complete required fields');
      return;
    }
    try {
      await adminApi.createUser(newUser);
      notify.success(locale === 'ar' ? 'تم!' : 'Done!', locale === 'ar' ? 'تم إنشاء المستخدم' : 'User created');
      setCreateOpen(false);
      setNewUser({ name: '', email: '', phone: '', role: 'student', password: '123456' });
      loadUsers();
    } catch (err) {
      notify.error('Error', err.message);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminApi.deleteUser(userId);
      notify.success(locale === 'ar' ? 'تم!' : 'Done!', locale === 'ar' ? 'تم حذف المستخدم' : 'User deleted');
      setUsers((us) => us.filter((u) => u.id !== userId));
    } catch (err) {
      notify.error('Error', err.message);
    }
  };


  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'student' ? 'teacher' : currentRole === 'teacher' ? 'admin' : 'student';
    try {
      await adminApi.updateUserRole(userId, nextRole);
      notify.success(locale === 'ar' ? 'تم التحديث' : 'Updated', locale === 'ar' ? 'تم تغيير رتبة المستخدم' : 'User role updated');
      loadUsers();
    } catch (err) {
      notify.error('Error', err.message);
    }
  };

  const columns = [
    {
      header: locale === 'ar' ? 'المستخدم' : 'User',
      accessor: 'full_name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: row.role === 'teacher' ? `${C.gold}15` : row.role === 'admin' ? '#f5ecff' : `${C.g700}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800,
            color: row.role === 'teacher' ? C.goldD : row.role === 'admin' ? '#6c3483' : C.g700,
            border: `1px solid ${row.role === 'teacher' ? `${C.gold}30` : 'transparent'}`,
          }}>
            {row.full_name?.[0] || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{row.full_name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: locale === 'ar' ? 'الجوال' : 'Phone',
      accessor: 'phone_number',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{row.phone_number || '—'}</span>
          {row.phone_number && (
            <a 
              href={`https://wa.me/${row.phone_number.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', fontSize: '1rem' }}
              title="WhatsApp"
            >
              💬
            </a>
          )}
        </div>
      ),
    },
    {
      header: locale === 'ar' ? 'الدور' : 'Role',
      accessor: 'role',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant={row.role}>{locale === 'ar' ? t[row.role] : row.role}</Badge>
          <button 
            onClick={() => handleRoleToggle(row.id, row.role)}
            style={{ 
              background: 'var(--bg-hover)', border: '1px solid var(--border-secondary)', 
              borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            {locale === 'ar' ? 'تغيير' : 'Switch'}
          </button>
        </div>
      ),
    },
    {
      header: locale === 'ar' ? 'تاريخ الانضمام' : 'Joined',
      accessor: 'created_at',
      render: (row) => <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{new Date(row.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>,
    },
    {
      header: locale === 'ar' ? 'إجراءات' : 'Actions',
      sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" style={{ color: '#dc2626', padding: '0.4rem' }}
            onClick={(e) => { e.stopPropagation(); if(confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) handleDelete(row.id); }}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.35rem' }}>
            👥 {t.userManagement}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.gold }}></span>
            {locale === 'ar' ? `${users.length} مستخدم مسجل` : `${users.length} registered users`}
          </p>
        </div>
        <Button variant="gold" onClick={() => setCreateOpen(true)} icon="➕">
          {t.createUser}
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['', 'student', 'teacher', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 600,
              background: roleFilter === r ? '#064e3b' : 'var(--bg-card)',
              color: roleFilter === r ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${roleFilter === r ? '#064e3b' : 'var(--border-secondary)'}`,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {r === '' ? (locale === 'ar' ? 'الكل' : 'All') : t[r]}
          </button>
        ))}
      </div>

      <Card>
        <Table
          columns={columns}
          data={users}
          searchable
          searchPlaceholder={locale === 'ar' ? 'ابحث عن مستخدم...' : 'Search users...'}
          emptyMessage={locale === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}
        />
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={t.createUser}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Input label={t.fullName} name="name" value={newUser.name}
            onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))} dir={dir} required />
          <Input label={t.email} name="email" type="email" value={newUser.email}
            onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))} dir={dir} required />
          <Input label={t.phone} name="phone" type="tel" value={newUser.phone}
            onChange={(e) => setNewUser((u) => ({ ...u, phone: e.target.value }))} dir={dir} />
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
              {t.role}
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
              style={{
                width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.6rem',
                border: '1.5px solid var(--border-primary)', background: 'var(--bg-input)',
                fontSize: '0.88rem', fontFamily: 'inherit', color: 'var(--text-primary)',
              }}
            >
              <option value="student">{t.student}</option>
              <option value="teacher">{t.teacher}</option>
              <option value="admin">{t.admin}</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t.cancel}</Button>
            <Button variant="primary" onClick={handleCreate} icon="✓">{t.save}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
