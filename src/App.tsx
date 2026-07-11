import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsStrip from "./components/StatsStrip";
import StorySection from "./components/StorySection";
import ValuesSection from "./components/ValuesSection";
import JobListings from "./components/JobListings";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <StorySection />
        <ValuesSection />
        <JobListings />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default App;
