// ── Badge Catalog — All platform badges ──────────────────────────────────────
export const BADGES = [
  // Streak badges
  { id: 'streak-7', category: 'streak', icon: '🔥', name: 'سلسلة أسبوع', nameEn: '7-Day Streak', desc: 'حافظ على سلسلة ٧ أيام متتالية', descEn: 'Maintain a 7-day streak', tier: 'bronze', requirement: 7, type: 'streak' },
  { id: 'streak-30', category: 'streak', icon: '💎', name: 'مثابر', nameEn: 'Persevering', desc: 'حافظ على سلسلة ٣٠ يوم', descEn: 'Maintain a 30-day streak', tier: 'silver', requirement: 30, type: 'streak' },
  { id: 'streak-100', category: 'streak', icon: '👑', name: 'ملك المداومة', nameEn: 'Streak King', desc: 'حافظ على سلسلة ١٠٠ يوم', descEn: 'Maintain a 100-day streak', tier: 'gold', requirement: 100, type: 'streak' },
  { id: 'streak-365', category: 'streak', icon: '🏆', name: 'عام كامل', nameEn: 'Full Year', desc: 'حافظ على سلسلة ٣٦٥ يوم', descEn: 'Maintain a 365-day streak', tier: 'legendary', requirement: 365, type: 'streak' },

  // Memorization milestones
  { id: 'juz-1', category: 'milestone', icon: '📖', name: 'ختمة الجزء الأول', nameEn: 'First Juz', desc: 'أكمل حفظ الجزء الأول', descEn: 'Complete memorizing the first Juz', tier: 'bronze', requirement: 1, type: 'juz' },
  { id: 'juz-5', category: 'milestone', icon: '📚', name: 'خمسة أجزاء', nameEn: 'Five Juz', desc: 'أكمل حفظ ٥ أجزاء', descEn: 'Complete memorizing 5 Juz', tier: 'silver', requirement: 5, type: 'juz' },
  { id: 'juz-10', category: 'milestone', icon: '🌟', name: 'عشرة أجزاء', nameEn: 'Ten Juz', desc: 'أكمل حفظ ١٠ أجزاء', descEn: 'Complete memorizing 10 Juz', tier: 'gold', requirement: 10, type: 'juz' },
  { id: 'juz-30', category: 'milestone', icon: '🎓', name: 'حافظ', nameEn: 'Hafiz', desc: 'أكمل حفظ القرآن كاملاً', descEn: 'Complete memorizing the entire Quran', tier: 'legendary', requirement: 30, type: 'juz' },

  // Accuracy badges
  { id: 'accuracy-90', category: 'accuracy', icon: '⭐', name: 'متقن', nameEn: 'Proficient', desc: 'حقق ٩٠٪ إتقان في سورة كاملة', descEn: 'Achieve 90% accuracy on a full Surah', tier: 'bronze', requirement: 90, type: 'accuracy' },
  { id: 'accuracy-95', category: 'accuracy', icon: '✨', name: 'متميز', nameEn: 'Distinguished', desc: 'حقق ٩٥٪ إتقان في ٥ سور', descEn: 'Achieve 95% accuracy on 5 Surahs', tier: 'silver', requirement: 95, type: 'accuracy' },
  { id: 'accuracy-100', category: 'accuracy', icon: '💫', name: 'إتقان تام', nameEn: 'Perfect', desc: 'حقق ١٠٠٪ في سورة بدون خطأ واحد', descEn: 'Achieve 100% on a Surah with zero errors', tier: 'gold', requirement: 100, type: 'accuracy' },

  // Special badges
  { id: 'early-bird', category: 'special', icon: '🌙', name: 'قيام الليل', nameEn: 'Night Prayer', desc: 'أكمل ٥ حصص قبل الفجر', descEn: 'Complete 5 sessions before Fajr', tier: 'silver', requirement: 5, type: 'earlySession' },
  { id: 'first-recording', category: 'special', icon: '🎙️', name: 'أول تسجيل', nameEn: 'First Recording', desc: 'أرسل أول تسجيل صوتي', descEn: 'Submit your first audio recording', tier: 'bronze', requirement: 1, type: 'recording' },
  { id: 'recordings-50', category: 'special', icon: '🎤', name: 'مسجل محترف', nameEn: 'Pro Recorder', desc: 'أرسل ٥٠ تسجيل صوتي', descEn: 'Submit 50 audio recordings', tier: 'gold', requirement: 50, type: 'recording' },
  { id: 'helper', category: 'special', icon: '🤝', name: 'معين', nameEn: 'Helper', desc: 'أحضر ٣ أصدقاء للمنصة', descEn: 'Invite 3 friends to the platform', tier: 'silver', requirement: 3, type: 'referral' },
];

export const BADGE_CATEGORIES = [
  { id: 'streak', name: 'سلاسل المواظبة', nameEn: 'Streaks', icon: '🔥' },
  { id: 'milestone', name: 'إنجازات الحفظ', nameEn: 'Milestones', icon: '📖' },
  { id: 'accuracy', name: 'الإتقان', nameEn: 'Accuracy', icon: '⭐' },
  { id: 'special', name: 'أوسمة خاصة', nameEn: 'Special', icon: '✨' },
];

export const TIER_COLORS = {
  bronze: { bg: '#fef3e2', border: '#d4a574', text: '#8b6914' },
  silver: { bg: '#f0f2f5', border: '#a8b2c1', text: '#5a6577' },
  gold: { bg: '#fffbea', border: '#d4af37', text: '#8b7a14' },
  legendary: { bg: '#f5ecff', border: '#9b59b6', text: '#6c3483' },
};
