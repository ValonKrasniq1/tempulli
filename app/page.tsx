import TopBar from "../components/TopBar";
import TopCampaign from "../components/TopCampaign";
import Header from "../components/Header";
import BillboardAd from "../components/BillboardAd";
import Hero from "../components/Hero";
import VideoStories from "../components/VideoStories";
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
      <BillboardAd />
      <Hero />
      <VideoStories />
      <LatestNews />
      <MostRead />
      <Categories />
      <Footer />
    </main>
  );
}