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

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
