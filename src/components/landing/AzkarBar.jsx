import { useState, useEffect } from 'react';
import { useLocale } from '../../lib/i18n';

const AZKAR = [
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ', translation: 'Glory be to Allah and His is the praise, Glory be to Allah the Supreme' },
  { text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ', translation: 'I seek forgiveness from Allah the Almighty, besides Whom there is no deity, the Ever-Living, the Sustainer' },
  { text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', translation: 'There is no deity except Allah alone, with no partner; His is the kingdom and praise' },
  { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ', translation: 'O Allah, send peace and blessings upon our Prophet Muhammad' },
  { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ', translation: 'There is no power nor strength except in Allah, the Most High, the Supreme' },
  { text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', translation: 'O Ever-Living, O Sustainer, by Your mercy I seek assistance' },
  { text: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا', translation: 'I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my Prophet' },
  { text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', translation: 'Sufficient for me is Allah; there is no deity except Him. On Him I rely' },
  { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا', translation: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds' },
  { text: 'سُبْحَانَ اللَّهِ • الْحَمْدُ لِلَّهِ • لَا إِلَهَ إِلَّا اللَّهُ • اللَّهُ أَكْبَرُ', translation: 'Glory be to Allah, Praise be to Allah, There is no god but Allah, Allah is Greatest' },
  { text: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', translation: 'O Allah, help me to remember You, be grateful to You, and worship You well' },
  { text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', translation: 'In the name of Allah, with Whose name nothing can cause harm on Earth nor in Heaven' },
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ', translation: 'Glory and praise be to Allah by the number of His creation and the weight of His Throne' },
  { text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ', translation: 'O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant' },
  { text: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', translation: 'O Allah, suffice me with Your lawful against Your unlawful, and enrich me with Your grace' },
  { text: 'اللَّهُمَّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي', translation: 'My Lord, expand for me my breast and ease for me my task' }
];

export default function AzkarBar() {
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % AZKAR.length);
        setFade(true);
      }, 400);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const changeZikr = (direction) => {
    setFade(false);
    setTimeout(() => {
      if (direction === 'next') {
        setIndex((prev) => (prev + 1) % AZKAR.length);
      } else {
        setIndex((prev) => (prev - 1 + AZKAR.length) % AZKAR.length);
      }
      setFade(true);
    }, 200);
  };

  const currentZikr = AZKAR[index];

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        width: '100%',
        background: 'linear-gradient(90deg, rgba(2, 44, 34, 0.95) 0%, rgba(6, 64, 48, 0.95) 50%, rgba(2, 44, 34, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '0.45rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        zIndex: 890,
        position: 'relative',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      }}
    >
      {/* Badge tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <span style={{ fontSize: '0.85rem', color: '#d4af37' }}>✨</span>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#d4af37',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '0.15rem 0.6rem',
            borderRadius: '1rem',
            fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
          }}
        >
          {locale === 'ar' ? `ذكر ${index + 1} من ${AZKAR.length}` : `Dhikr ${index + 1}/${AZKAR.length}`}
        </span>
      </div>

      {/* Zikr Text Ticker */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          opacity: fade ? 1 : 0,
          transform: fade ? 'scale(1)' : 'scale(0.98)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          fontFamily: "'Amiri', 'Tajawal', serif",
          color: '#ecfdf5',
          fontSize: 'clamp(0.95rem, 2vw, 1.12rem)',
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '0.03em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{currentZikr.text}</span>
        {locale !== 'ar' && (
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400, fontFamily: "'Inter', sans-serif" }}>
            ({currentZikr.translation})
          </span>
        )}
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
        <button
          onClick={() => changeZikr('prev')}
          title={locale === 'ar' ? 'الذكر السابق' : 'Previous'}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#d4af37',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            lineHeight: 1,
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(212, 175, 55, 0.25)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >
          {locale === 'ar' ? '›' : '‹'}
        </button>

        <button
          onClick={() => changeZikr('next')}
          title={locale === 'ar' ? 'الذكر التالي' : 'Next'}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#d4af37',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            lineHeight: 1,
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(212, 175, 55, 0.25)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >
          {locale === 'ar' ? '‹' : '›'}
        </button>
      </div>
    </div>
  );
}
