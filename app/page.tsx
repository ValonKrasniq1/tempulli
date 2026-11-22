
import TopBar from "../components/TopBar";
import TopCampaign from "../components/TopCampaign";
import Header from "../components/Header";
import BreakingNews from "../components/BreakingNews";
import BillboardAd from "../components/BillboardAd";
import Hero from "../components/Hero";
import AdSlot from "../components/AdSlot";
import VideoStories from "../components/VideoStories";
import LatestNews from "../components/LatestNews";
import MostRead from "../components/MostRead";
import SidebarAd from "../components/SidebarAd";
import Sidebar from "../components/Sidebar";
import Categories from "../components/Categories";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#151515]">

      <TopBar />
      <TopCampaign />
      <Header />
      <BreakingNews />

      <BillboardAd />

      <div className="tempulli-layout">

        {/* MAJTAS - REKLAMAT */}

        <aside className="tempulli-ads">

          <SidebarAd />

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
            <MostRead />
          </section>

        </aside>

        {/* QENDER - LAJMET */}

        <div className="tempulli-content">

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <Hero />
          </section>

          <AdSlot position="hero" />

          <section
            id="video"
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <VideoStories />
          </section>

          <section
            id="lajmet"
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <LatestNews />
          </section>

          <AdSlot position="latest-news" />

        </div>

        {/* DJATHTAS - NAVIGIMI */}

        <Sidebar />

      </div>

      <section className="border-t border-gray-200 bg-white">
        <Categories />
      </section>

      <div className="tempulli-container py-6">
        <AdSlot position="footer" />
      </div>

      <Footer />

      <AdSlot position="sticky-mobile" />

    </main>
  );
}
