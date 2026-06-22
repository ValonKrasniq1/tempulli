import TopBar from "../components/TopBar";
import TopCampaign from "../components/TopCampaign";
import Header from "../components/Header";
import AdsBanner from "../components/AdsBanner";
import Hero from "../components/Hero";
import LatestNews from "../components/LatestNews";
import MostRead from "../components/MostRead";
import Categories from "../components/Categories";
import BreakingNews from "../components/BreakingNews";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <TopCampaign />
      <Header />
      <BreakingNews />
      <AdsBanner />
      <Hero />
      <LatestNews />
      <MostRead />
      <Categories />
      <Footer />
    </main>
  );
}