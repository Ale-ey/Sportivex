import { BrowserRouter, Route, Routes } from "react-router-dom";
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

// Global pages
import SportsComplexAccount from "./pages/global/SportsComplexAccount";

// Sports pages
import Events from "./pages/sports/Events";
import Gym from "./pages/sports/Gym";

// Swimming pages
import SwimmingRegistration from "./pages/swimming/Registration";
import TimeTracking from "./pages/swimming/TimeTracking";
import Invoice from "./pages/swimming/Invoice";
import Cancellation from "./pages/swimming/Cancellation";
import FreezeApplication from "./pages/swimming/FreezeApplication";
import RulesRegulations from "./pages/swimming/RulesRegulations";
import Shop from "./pages/swimming/Shop";

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
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Global routes */}
          <Route path="/global/sports-complex" element={<SportsComplexAccount />} />

          {/* Sports routes */}
          <Route path="/sports/events" element={<Events />} />
          <Route path="/gym" element={<Gym />} />

          {/* Swimming routes */}
          <Route path="/swimming/registration" element={<SwimmingRegistration />} />
          <Route path="/swimming/time-tracking" element={<TimeTracking />} />
          <Route path="/swimming/invoice" element={<Invoice />} />
          <Route path="/swimming/cancellation" element={<Cancellation />} />
          <Route path="/swimming/freeze" element={<FreezeApplication />} />
          <Route path="/swimming/rules" element={<RulesRegulations />} />
          <Route path="/swimming/shop" element={<Shop />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
