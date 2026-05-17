import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import LogosBand from '@/components/marketing/LogosBand'
import StatsBand from '@/components/marketing/StatsBand'
import Benefits from '@/components/marketing/Benefits'
import Features from '@/components/marketing/Features'
import Integrations from '@/components/marketing/Integrations'
import HowItWorks from '@/components/marketing/HowItWorks'
import FounderNote from '@/components/marketing/FounderNote'
import FAQ from '@/components/marketing/FAQ'
import CTASection from '@/components/marketing/CTASection'
import Footer from '@/components/marketing/Footer'

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
  )
}
