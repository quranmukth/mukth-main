import { useState } from 'react';
import { C, TEACHERS } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';
import { useBookingStore } from '../stores/bookingStore';
import { useNotificationStore } from '../stores/notificationStore';

export default function PlanAdjuster({ onOpenModal }) {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [days, setDays] = useState(2);
  const sessions = days * 4;
  const [mins, setMins] = useState(30);
  const [teacher, setTeacher] = useState(TEACHERS[0].id);
  const [contact, setContact] = useState({ name: '', phone: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success

  const createBooking = useBookingStore((s) => s.createBooking);
  const notify = useNotificationStore();

  const handleDayChange = (d) => {
    setDays(d);
  };

  const handleSubmit = async () => {
    if (!contact.name || !contact.phone) {
      notify.error(
        locale === 'ar' ? 'بيانات غير مكتملة' : 'Incomplete Data',
        locale === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف' : 'Please enter your name and phone number'
      );
      return;
    }
    
    setStatus('loading');
    try {
      const selectedTeacherName = TEACHERS.find(t => t.id === teacher)?.name || '';
      const response = await createBooking({
        studentName: contact.name,
        phone: contact.phone,
        curriculum: 'حفظ وتثبيت القرآن الكريم',
        teacherName: selectedTeacherName,
        plan: {
          sessions,
          durationMins: mins,
          label: `${sessions} حصص شهرياً (${mins} دقيقة)`
        }
      });

      setStatus('success');
      
      notify.success(
        locale === 'ar' ? 'تم تجهيز الحجز بنجاح 🎉' : 'Booking Prepared 🎉',
        locale === 'ar' ? `رقم مرجعك: ${response.booking?.bookingRef}` : `Reference: ${response.booking?.bookingRef}`
      );

      // Auto open WhatsApp link
      if (response.waLink) {
        window.open(response.waLink, '_blank');
      }

      // Reset contact form
      setContact({ name: '', phone: '' });

      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('Booking error:', err);
      notify.error(
        locale === 'ar' ? 'خطأ في الحجز' : 'Booking Error',
        err.message || (locale === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم' : 'Server error during booking')
      );
      setStatus('idle');
    }
  };

  return (
    <section id="plan-adjuster" className="section-pad" style={{ 
      background: `linear-gradient(135deg, ${C.g900} 0%, ${C.g850} 100%)`,
      direction: dir,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
        background: `radial-gradient(circle, ${C.gold}15 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-label" style={{ color: C.gold }}>✦ {locale === 'ar' ? 'صمم رحلتك' : 'Design Your Journey'}</span>
          <h2 className="section-title" style={{ color: '#fff' }}>{locale === 'ar' ? 'اختر خطة الحفظ المناسبة لك' : 'Customize Your Study Plan'}</h2>
          <p className="section-sub" style={{ color: 'rgba(255,255,255,0.7)', margin: '0 auto' }}>
            {locale === 'ar' ? 'حدد عدد الحصص والأيام والمعلم المفضل وسنقوم بتنسيق الجدول المثالي لك' : 'Select your sessions, days, and preferred teacher to coordinate your perfect schedule'}
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '2rem',
          padding: '2.5rem',
          maxWidth: '900px',
          margin: '0 auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem'
        }}>
          {/* Left Column: Adjustments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {/* Days per week */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
                  {locale === 'ar' ? 'كم يوم في الأسبوع؟' : 'How many days per week?'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    background: C.gold, color: C.g900, padding: '0.2rem 0.8rem', 
                    borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 800 
                  }}>
                    {sessions} {locale === 'ar' ? 'حصة شهرياً' : 'Sessions / Month'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {[1, 2, 3, 4, 5, 6].map(d => (
                  <button 
                    key={d}
                    onClick={() => handleDayChange(d)}
                    style={{
                      flex: 1, padding: '0.8rem 0.4rem', borderRadius: '0.8rem',
                      background: days === d ? C.gold : 'rgba(255,255,255,0.05)',
                      color: days === d ? C.g900 : '#fff',
                      border: '1px solid',
                      borderColor: days === d ? C.gold : 'rgba(255,255,255,0.1)',
                      fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: days === d ? `0 0 20px ${C.gold}44` : 'none',
                      transform: days === d ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >{d}</button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                  {locale === 'ar' ? 'مدة الحصة؟' : 'Minutes per session?'}
                </label>
                <span style={{ color: C.gold, fontWeight: 800 }}>{mins} {locale === 'ar' ? 'دقيقة' : 'Mins'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[30, 45, 60].map(m => (
                  <button 
                    key={m}
                    onClick={() => setMins(m)}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: '0.5rem',
                      background: mins === m ? C.gold : 'rgba(255,255,255,0.05)',
                      color: mins === m ? C.g900 : '#fff',
                      border: 'none', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >{m} {locale === 'ar' ? 'د' : 'm'}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Teacher & Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {/* Teacher Selection */}
            <div>
              <label style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.8rem' }}>
                {locale === 'ar' ? 'المعلم المفضل؟' : 'Preferred Teacher?'}
              </label>
              <select 
                value={teacher} onChange={(e) => setTeacher(parseInt(e.target.value))}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.08)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)', outline: 'none',
                  fontFamily: 'inherit'
                }}
              >
                {TEACHERS.map(t => (
                  <option key={t.id} value={t.id} style={{ background: C.g900 }}>{locale === 'ar' ? t.name : t.nameEn}</option>
                ))}
              </select>
            </div>

            {/* Summary Box */}
            <div style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: `1px dashed ${C.gold}44`,
              borderRadius: '1rem',
              padding: '1.5rem',
              marginTop: 'auto'
            }}>
              <div style={{ color: C.gold, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {locale === 'ar' ? 'ملخص رحلتك' : 'Your Journey Summary'}
              </div>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>
                {locale === 'ar' 
                  ? `${sessions} حصة شهرياً، بمعدل ${days} أيام في الأسبوع، مدة كل حصة ${mins} دقيقة مع ${TEACHERS.find(t => t.id === teacher)?.name}`
                  : `${sessions} sessions/month, ${days} days/week, ${mins} mins each with ${TEACHERS.find(t => t.id === teacher)?.nameEn}`
                }
              </div>
            </div>

            {/* Contact Inputs */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                placeholder={locale === 'ar' ? 'الاسم' : 'Name'}
                value={contact.name}
                onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', outline: 'none'
                }}
              />
              <input 
                placeholder={locale === 'ar' ? 'رقم الهاتف' : 'Phone'}
                value={contact.phone}
                onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', outline: 'none'
                }}
              />
            </div>

            <button 
              onClick={handleSubmit}
              className="btn-gold"
              disabled={status === 'loading'}
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '0.2rem' }}
            >
              {status === 'loading' ? (locale === 'ar' ? 'جاري إعداد الحجز...' : 'Preparing Booking...') : 
               status === 'success' ? (locale === 'ar' ? 'تم فتح الواتساب بنجاح ✓' : 'Opening WhatsApp ✓') :
               (locale === 'ar' ? 'تأكيد الاشتراك وتواصل واتساب 💬' : 'Confirm Subscription & WhatsApp 💬')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
