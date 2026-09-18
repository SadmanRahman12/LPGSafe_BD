import { HeroSection } from "@/components/landing/hero";
import { TrustStats } from "@/components/landing/trust-stats";
import { ProblemSolutionSection } from "@/components/landing/problem-solution";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { SafetySection } from "@/components/landing/safety-preview";
import { RegulatorSection } from "@/components/landing/regulator-section";
import { IoTSection } from "@/components/landing/iot-section";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrustStats />
      <ProblemSolutionSection />
      <HowItWorksSection />
      <SafetySection />
      <RegulatorSection />
      <IoTSection />
    </div>
  );
}
