// ── App.jsx — Root with Router ───────────────────────────────────────────────
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useRealtimeStore } from './stores/realtimeStore';
import { useThemeStore } from './lib/theme';
import { themeTokens } from './lib/theme';
import ToastContainer from './components/notifications/ToastContainer';
import { Analytics } from "@vercel/analytics/react";

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import ProgressTree from './pages/student/ProgressTree';
import RecordingPage from './pages/student/RecordingPage';
import MyRecordings from './pages/student/MyRecordings';
import BadgesPage from './pages/student/BadgesPage';
import StreakTracker from './pages/student/StreakTracker';
import StudentProfile from './pages/student/StudentProfile';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ReviewQueue from './pages/teacher/ReviewQueue';
import MyStudents from './pages/teacher/MyStudents';
import TeacherSchedule from './pages/teacher/TeacherSchedule';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import HalaqatScheduler from './pages/admin/HalaqatScheduler';
import Reports from './pages/admin/Reports';
import AdminSettings from './pages/admin/AdminSettings';
import Sessions from './pages/Sessions';

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const role = useAuthStore((s) => s.role);
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const locale = window.localStorage.getItem('i18n-locale') || 'ar';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-secondary)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Approval check for teachers
  if (role === 'teacher' && user?.isApproved === false) {
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', 
        background: 'linear-gradient(135deg, #011a12 0%, #064e3b 100%)', padding: '1.5rem',
        textAlign: 'center', color: '#fff', direction: locale === 'ar' ? 'rtl' : 'ltr'
      }}>
        <div style={{ maxWidth: '500px', background: 'rgba(255,255,255,0.05)', padding: '3rem 2rem', borderRadius: '1.5rem', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⏳</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic'" : "'Inter'" }}>
            {locale === 'ar' ? 'حسابك قيد المراجعة' : 'Account Under Review'}
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
            {locale === 'ar' 
              ? `طلب انضمامك كمعلم قيد المراجعة حالياً من قبل الإدارة. سنقوم بتفعيل حسابك قريباً.` 
              : `Your teacher account is under review. Our team is verifying your application. We will activate your account once approved.`}
          </p>
          <button 
            onClick={() => logout()}
            style={{ padding: '0.8rem 2rem', borderRadius: '0.8rem', background: '#d4af37', color: '#011a12', fontWeight: 800, border: 'none', cursor: 'pointer' }}
          >
            {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirect = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student';
    return <Navigate to={redirect} replace />;
  }
  return children;
}

export default function App() {
  const themeMode = useThemeStore((s) => s.mode);
  const initAuth = useAuthStore((s) => s.init);
  const { init: initRealtime, cleanup: cleanupRealtime } = useRealtimeStore();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  // Initialize Auth
  useEffect(() => {
    initAuth();
    return () => cleanupRealtime();
  }, [initAuth, cleanupRealtime]);

  // Handle Realtime Initialization when role is available
  useEffect(() => {
    if (user && role) {
      initRealtime(user._id, role);
    } else {
      cleanupRealtime();
    }
  }, [user, role, initRealtime, cleanupRealtime]);


  // Apply theme CSS variables on mount and change
  useEffect(() => {
    const tokens = themeTokens[themeMode] || themeTokens.light;
    Object.entries(tokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Dashboard */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="progress" element={<ProgressTree />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="record" element={<RecordingPage />} />
          <Route path="recordings" element={<MyRecordings />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="streak" element={<StreakTracker />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Teacher Dashboard */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<TeacherDashboard />} />
          <Route path="review" element={<ReviewQueue />} />
          <Route path="students" element={<MyStudents />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="halaqat" element={<HalaqatScheduler />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global toast notifications */}
      <ToastContainer />

      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}
