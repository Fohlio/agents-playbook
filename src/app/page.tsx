import Header from "@/shared/ui/landing/Header";
import HeroSection from "@/shared/ui/landing/HeroSection";
import FeaturesSection from "@/shared/ui/landing/FeaturesSection";
import SetupSection from "@/shared/ui/landing/SetupSection";
import GetStartedSection from "@/shared/ui/landing/GetStartedSection";
import RoadmapSection from "@/shared/ui/landing/RoadmapSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main role="main">
        <HeroSection />
        <GetStartedSection />
        <FeaturesSection />
        <SetupSection />
        <RoadmapSection />
      </main>
    </div>
  );
}
