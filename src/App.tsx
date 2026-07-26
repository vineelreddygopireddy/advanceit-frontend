import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsStrip from "./components/StatsStrip";
import StorySection from "./components/StorySection";
import ValuesSection from "./components/ValuesSection";
import JobListings from "./components/JobListings";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import DashboardPage from "./pages/DashboardPage";
import AdminEmployeesPage from "./pages/AdminEmployeesPage";
import AdminProjectsPage from "./pages/AdminProjectsPage";
import "./App.css";

function HomePage() {
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile-setup" element={<ProfileSetupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin/employees" element={<AdminEmployeesPage />} />
      <Route path="/admin/projects" element={<AdminProjectsPage />} />
    </Routes>
  );
}

export default App;
