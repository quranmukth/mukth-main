import { useState, useEffect } from 'react';
import { useLocale } from '../../lib/i18n';

const AZKAR = [
  { text: 'سُبْحَانَ اللَّهِ', translation: 'Glory be to Allah' },
  { text: 'الْحَمْدُ لِلَّهِ', translation: 'Praise be to Allah' },
  { text: 'لَا إِلَهَ إِلَّا اللَّهُ', translation: 'There is no god but Allah' },
  { text: 'اللَّهُ أَكْبَرُ', translation: 'Allah is the Greatest' },
  { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translation: 'There is no power nor strength except in Allah' },
];

export default function AzkarBar() {
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % AZKAR.length);
        setFade(true);
      }, 500); // 500ms fade out before changing index
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const currentZikr = AZKAR[index];

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      style={{
        width: '100%',
        background: 'rgba(6, 44, 34, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(52, 211, 153, 0.25)',
        borderTop: '1px solid rgba(212, 175, 55, 0.15)',
        padding: '0.55rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        gap: '0.75rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        zIndex: 90,
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '0.9rem', color: '#d4af37', flexShrink: 0 }}>✨</span>
      
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: fade ? 1 : 0,
          transform: fade ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          fontFamily: "'Amiri', 'Tajawal', serif",
          color: '#ecfdf5',
          fontSize: '1.05rem',
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '0.04em',
        }}
      >
        <span>{currentZikr.text}</span>
        {locale !== 'ar' && (
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>
            ({currentZikr.translation})
          </span>
        )}
      </div>

      <span style={{ fontSize: '0.9rem', color: '#d4af37', flexShrink: 0 }}>✨</span>
    </div>
  );
}
