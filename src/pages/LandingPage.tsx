import React from 'react'
import HeroSection from '../components/sections/HeroSection'
import ProblemSection from '../components/sections/ProblemSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import ScoreEngineSection from '../components/sections/ScoreEngineSection'
import SimulatorSection from '../components/sections/SimulatorSection'
import SchemesSection from '../components/sections/SchemesSection'
import UnderwriterSection from '../components/sections/UnderwriterSection'
import CTAFooter from '../components/sections/CTAFooter'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <ScoreEngineSection />
      <SimulatorSection />
      <SchemesSection />
      <UnderwriterSection />
      <CTAFooter />
    </main>
  )
}
