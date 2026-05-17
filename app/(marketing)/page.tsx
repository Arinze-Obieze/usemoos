import Benefits from "@/components/marketing/Benefits";
import CTASection from "@/components/marketing/CTASection";
import FAQ from "@/components/marketing/FAQ";
import Features from "@/components/marketing/Features";
import Footer from "@/components/marketing/Footer";
import FounderNote from "@/components/marketing/FounderNote";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import Integrations from "@/components/marketing/Integrations";
import LogosBand from "@/components/marketing/LogosBand";
import Navbar from "@/components/marketing/Navbar";
import StatsBand from "@/components/marketing/StatsBand";

export default function MarketingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <LogosBand />
      <StatsBand />
      <Benefits />
      <Features />
      <Integrations />
      <HowItWorks />
      <FounderNote />
      <FAQ />
      <CTASection />
      <Footer />
    </>
  );
}
