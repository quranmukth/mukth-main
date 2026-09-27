import { useState } from 'react';
import { useLocale } from '../../lib/i18n';
import { DAILY_VERSES } from '../../data/quranData';

export default function DailyVerseCard() {
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  const verse = DAILY_VERSES[currentIndex];

  const handleNextVerse = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DAILY_VERSES.length);
      setAnimating(false);
    }, 250);
  };

  const handlePrevVerse = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + DAILY_VERSES.length) % DAILY_VERSES.length);
      setAnimating(false);
    }, 250);
  };

  const handleShare = () => {
    const textToShare = `﴿ ${verse.arabic} ﴾\n(${verse.surah} - آية ${verse.ayah})\n💡 التفسير الميسر: ${verse.tafseer}\n— منصة مُكث لتعليم القرآن الكريم`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        style={{
          width: '100%',
          maxWidth: '900px',
          background: 'linear-gradient(135deg, rgba(6, 44, 34, 0.96) 0%, rgba(1, 26, 18, 0.98) 100%)',
          borderRadius: '2rem',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          padding: '2.25rem clamp(1.5rem, 4vw, 3.25rem)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 50px rgba(212, 175, 55, 0.12)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Decorative corner accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: locale === 'ar' ? 0 : 'auto',
            left: locale === 'ar' ? 'auto' : 0,
            width: '160px',
            height: '160px',
            background: 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37, #997415)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
                flexShrink: 0
              }}
            >
              📖
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#d4af37',
                    margin: 0,
                    fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                  }}
                >
                  {locale === 'ar' ? 'رسالتك القرآنية اليوم والتفسير الميسر' : 'Your Daily Quranic Message'}
                </h2>
                {verse.category && (
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, color: '#ecfdf5',
                    background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.3)',
                    padding: '0.15rem 0.6rem', borderRadius: '1rem'
                  }}>
                    {verse.category}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', margin: '0.2rem 0 0' }}>
                {locale === 'ar' ? `${verse.surah} • آية ${verse.ayah}` : `${verse.surahEn} • Ayah ${verse.ayah}`}
                <span style={{ margin: '0 0.5rem', opacity: 0.4 }}>|</span>
                <span style={{ color: '#d4af37' }}>{locale === 'ar' ? `آية ${currentIndex + 1} من ${DAILY_VERSES.length}` : `Verse ${currentIndex + 1}/${DAILY_VERSES.length}`}</span>
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrevVerse}
              title={locale === 'ar' ? 'الآية السابقة' : 'Previous Ayah'}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#d4af37',
                padding: '0.45rem 0.8rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              {locale === 'ar' ? 'السابقة ›' : '‹ Prev'}
            </button>
            <button
              onClick={handleNextVerse}
              title={locale === 'ar' ? 'آية أخرى' : 'Next Ayah'}
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1))',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                color: '#fef3c7',
                padding: '0.45rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#d4af37'; e.currentTarget.style.color = '#022c22'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1))'; e.currentTarget.style.color = '#fef3c7'; }}
            >
              🔄 {locale === 'ar' ? 'آية تالية' : 'Next Ayah'}
            </button>
          </div>
        </div>

        {/* Ayah Content */}
        <div
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          <div
            style={{
              padding: '1.5rem 1.75rem',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '1.25rem',
              borderInlineStart: '4px solid #d4af37',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              borderInlineEnd: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: '1.5rem',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            <p
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: 'clamp(1.3rem, 2.7vw, 1.7rem)',
                color: '#fef3c7',
                lineHeight: 2.2,
                margin: 0,
                textAlign: 'center',
                letterSpacing: '0.03em',
              }}
            >
              ﴿ {verse.arabic} ﴾
            </p>
          </div>

          {/* Tafseer Muyassar */}
          <div style={{
            padding: '1.1rem 1.25rem',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: '#d4af37', fontWeight: 800, margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              💡 {locale === 'ar' ? 'التفسير الميسر:' : 'Simplified Commentary:'}
            </h4>
            <p style={{ fontSize: '0.96rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.85, margin: 0, fontWeight: 500 }}>
              {locale === 'ar' ? verse.tafseer : verse.tafseerEn}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1.1rem',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            ✦ {locale === 'ar' ? 'منصة مُكث — تدبر وتلاوة بتأنٍّ' : 'Mukth Platform — Reflect & Recite'}
          </span>

          <button
            onClick={handleShare}
            style={{
              background: copied ? '#10b981' : 'rgba(212, 175, 55, 0.15)',
              border: `1px solid ${copied ? '#10b981' : 'rgba(212, 175, 55, 0.4)'}`,
              color: copied ? '#fff' : '#d4af37',
              padding: '0.5rem 1.2rem',
              borderRadius: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          >
            {copied ? (locale === 'ar' ? 'تم النسخ ✓' : 'Copied ✓') : (locale === 'ar' ? 'مشاركة الآية والتفسير 🔗' : 'Share Ayah & Commentary 🔗')}
          </button>
        </div>
      </div>
    </section>
  );
}
