import { useState } from 'react';
import { useLocale, useT } from '../../lib/i18n';
import { DAILY_VERSES } from '../../data/quranData';

export default function DailyVerseCard() {
  const locale = useLocale();
  const t = useT();
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

  const handleShare = () => {
    const textToShare = `${verse.arabic}\n(${verse.surah} - آية ${verse.ayah})\nالتفسير الميسر: ${verse.tafseer}\n— منصة مُكث لتعليم القرآن الكريم`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        style={{
          width: '100%',
          maxWidth: '850px',
          background: 'linear-gradient(135deg, rgba(6, 44, 34, 0.95) 0%, rgba(1, 26, 18, 0.98) 100%)',
          borderRadius: '1.75rem',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          padding: '2rem clamp(1.5rem, 4vw, 3rem)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 0 40px rgba(212, 175, 55, 0.1)',
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
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37, #997415)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              }}
            >
              📖
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#d4af37',
                  margin: 0,
                  fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                }}
              >
                {locale === 'ar' ? 'رسالتك القرآنية اليوم' : 'Your Daily Quranic Message'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', margin: '0.1rem 0 0' }}>
                {locale === 'ar' ? verse.surah + ' • آية ' + verse.ayah : verse.surahEn + ' • Ayah ' + verse.ayah}
              </p>
            </div>
          </div>

          <button
            onClick={handleNextVerse}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#d4af37',
              padding: '0.45rem 0.9rem',
              borderRadius: '0.75rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.18)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            🔄 {locale === 'ar' ? 'آية أخرى' : 'Another Ayah'}
          </button>
        </div>

        {/* Ayah Content */}
        <div
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          <div
            style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '1.25rem',
              borderInlineStart: '4px solid #d4af37',
              marginBottom: '1.25rem',
            }}
          >
            <p
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
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
          <div style={{ padding: '0 0.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#d4af37', fontWeight: 700, margin: '0 0 0.4rem' }}>
              💡 {locale === 'ar' ? 'التفسير الميسر:' : 'Simplified Commentary:'}
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: 0 }}>
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
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
            ✦ {locale === 'ar' ? 'مُكث — تلاوة وتدبر' : 'Mukth — Recitation & Reflection'}
          </span>

          <button
            onClick={handleShare}
            style={{
              background: copied ? '#10b981' : 'rgba(212, 175, 55, 0.15)',
              border: `1px solid ${copied ? '#10b981' : 'rgba(212, 175, 55, 0.4)'}`,
              color: copied ? '#fff' : '#d4af37',
              padding: '0.45rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          >
            {copied ? (locale === 'ar' ? 'تم النسخ ✓' : 'Copied ✓') : (locale === 'ar' ? 'مشاركة الآية 🔗' : 'Share Ayah 🔗')}
          </button>
        </div>
      </div>
    </section>
  );
}
