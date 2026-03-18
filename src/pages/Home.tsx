import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { KumbhProximity } from '../components/KumbhProximity';
import { RoomsSection } from '../components/RoomsSection';
import { FacilitiesSection } from '../components/FacilitiesSection';
import { AboutSection } from '../components/AboutSection';
import { GallerySection } from '../components/GallerySection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { FAQSection } from '../components/FAQSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header />
      <main>
        <HeroSection />
        <KumbhProximity />
        <RoomsSection />
        <FacilitiesSection />
        <AboutSection />
        <GallerySection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
