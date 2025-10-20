import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Index from "./pages/home/Index";
import FireCatProject from "./pages/home/FireCatProject";
import SportRetailProject from "./pages/home/SportRetailProject";
import WorkwearProject from "./pages/home/WorkwearProject";
import HockeyProject from "./pages/home/HockeyProject";
import PetProject from "./pages/home/PetProject";
import TechDetails from "./pages/home/TechDetails";
import DevelopmentProcess from "./pages/home/DevelopmentProcess";
import About from "./pages/home/About";
import Blog from "./pages/home/Blog";
import BlogPostDetail from "./pages/home/BlogPostDetail";
import Careers from "./pages/home/Careers";
import NotFound from "./pages/home/NotFound";
import PrivacyPolicy from "./pages/home/PrivacyPolicy";

// Auth pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SetNewPassword from "./pages/auth/SetNewPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import HomeRoute from "./pages/dashboard/routes/HomeRoute";
import SportsRoute from "./pages/dashboard/routes/SportsRoute";
import LeaguesRoute from "./pages/dashboard/routes/LeaguesRoute";
import TrainingRoute from "./pages/dashboard/routes/TrainingRoute";
import AiChatRoute from "./pages/dashboard/routes/AiChatRoute";
import AccountRoute from "./pages/dashboard/routes/AccountRoute";
import ProfileRoute from "./pages/dashboard/routes/ProfileRoute";
import SettingsRoute from "./pages/dashboard/routes/SettingsRoute";
import BillingRoute from "./pages/dashboard/routes/BillingRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Home routes */}
          <Route path="/" element={<Index />} />
          <Route path="/projects/firecat" element={<FireCatProject />} />
          <Route
            path="/projects/sport-retail"
            element={<SportRetailProject />}
          />
          <Route path="/projects/workwear" element={<WorkwearProject />} />
          <Route path="/projects/hockey" element={<HockeyProject />} />
          <Route path="/projects/pet-tracker" element={<PetProject />} />
          <Route path="/tech-details" element={<TechDetails />} />
          <Route path="/development-process" element={<DevelopmentProcess />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostDetail />} />

          {/* Auth routes */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/set-new-password" element={<SetNewPassword />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<HomeRoute />} />
            <Route path="sports" element={<SportsRoute />} />
            <Route path="leagues" element={<LeaguesRoute />} />
            <Route path="training" element={<TrainingRoute />} />
            <Route path="ai-chat" element={<AiChatRoute />} />
            <Route path="account" element={<AccountRoute />} />
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="settings" element={<SettingsRoute />} />
            <Route path="billing" element={<BillingRoute />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
