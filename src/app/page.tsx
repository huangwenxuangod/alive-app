import { Hero } from "@/components/home/hero";
import { Steps } from "@/components/home/steps";
import { Feed } from "@/components/home/feed";
import { StatusFlow } from "@/components/home/status-flow";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="divider" />
      <Steps />
      <div className="divider" />
      <Feed />
      <div className="divider" />
      <StatusFlow />
    </>
  );
}
