import { useState } from 'react';
import { useLocale, useT } from '../../lib/i18n';
import Navbar from '../../components/Navbar';
import AzkarBar from '../../components/landing/AzkarBar';
import HeroSection from '../../components/HeroSection';
import DailyVerseCard from '../../components/landing/DailyVerseCard';
import StatsBar from '../../components/StatsBar';
import AboutSection from '../../components/AboutSection';
import CurriculaSection from '../../components/CurriculaSection';
import HowItWorks from '../../components/HowItWorks';
import PlanAdjuster from '../../components/PlanAdjuster';
import PricingSection from '../../components/PricingSection';
import TeachersSection from '../../components/TeachersSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import ContactSection from '../../components/ContactSection';
import Footer from '../../components/Footer';
import RegisterModal from '../../components/shared/RegisterModal';
import WhatsAppFAB from '../../components/WhatsAppFAB';
import ScrollToTop from '../../components/ScrollToTop';

export default function LandingPage() {
  const locale = useLocale();
  const t = useT();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div dir={dir} lang={locale} style={{ 
      fontFamily: locale === 'ar' ? "'Tajawal', 'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <Navbar onOpenModal={openModal} />
      <AzkarBar />
      <main>
        <HeroSection onOpenModal={openModal} />
        <DailyVerseCard />
        <StatsBar />
        <AboutSection />
        <CurriculaSection onOpenModal={openModal} />
        <HowItWorks />
        <PricingSection onOpenModal={openModal} />
        <PlanAdjuster onOpenModal={openModal} />
        <TeachersSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <RegisterModal isOpen={modalOpen} onClose={closeModal} />
      <WhatsAppFAB />
      <ScrollToTop />
    </div>
  );
}
