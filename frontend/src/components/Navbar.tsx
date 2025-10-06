import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
        isScrolled ? "bg-white shadow-sm border-b border-gray-200" : "bg-transparent backdrop-blur-none"
      )}
      initial={{
        opacity: 1,
        y: 0,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span
                className={cn(
                  "text-2xl font-bold transition-colors duration-300",
                  isScrolled ? "text-[#1e40af]" : "text-white"
                )}
              >
                Sportivex
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu className={cn(isScrolled ? "" : "text-white")}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isScrolled
                          ? "text-[#1e40af] hover:text-blue-600"
                          : "text-gray-200 hover:text-white bg-transparent hover:bg-white/20"
                      )}
                    >
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/about">
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isScrolled
                          ? "text-[#1e40af] hover:text-blue-600"
                          : "text-gray-200 hover:text-white bg-transparent hover:bg-white/20"
                      )}
                    >
                      About Us
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      isScrolled
                        ? "text-[#1e40af] hover:text-blue-600"
                        : "text-gray-200 hover:text-white bg-transparent hover:bg-white/20"
                    )}
                  >
                    Customer Cases
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px] bg-white border border-gray-200">
                      <li>
                        <Link
                          to="/projects/firecat"
                          className="block p-3 space-y-1 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-[#1e40af]">6th SENSE Safety</div>
                          <p className="text-sm text-gray-600">
                            IoT sensors for firefighter protection
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/projects/sport-retail"
                          className="block p-3 space-y-1 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-[#1e40af]">Better Hockey</div>
                          <p className="text-sm text-gray-600">
                            Connected sports equipment development
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/projects/workwear"
                          className="block p-3 space-y-1 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-[#1e40af]">Industrial Workwear</div>
                          <p className="text-sm text-gray-600">
                            Smart PPE for extreme environments
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/projects/hockey"
                          className="block p-3 space-y-1 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-[#1e40af]">AirHive Tracking</div>
                          <p className="text-sm text-gray-600">
                            Smart equipment for Berg Trampolines
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/projects/pet-tracker"
                          className="block p-3 space-y-1 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-[#1e40af]">
                            Pet Activity Monitoring
                          </div>
                          <p className="text-sm text-gray-600">
                            IoT solutions for pet health tracking
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      isScrolled
                        ? "text-[#1e40af] hover:text-blue-600"
                        : "text-gray-200 hover:text-white bg-transparent hover:bg-white/20"
                    )}
                  >
                    Learn More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px] bg-white border border-gray-200">
                      <li>
                        <Link
                          to="/tech-details"
                          className="block p-3 space-y-1 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-[#1e40af]">Technology Platform</div>
                          <p className="text-sm text-gray-600">
                            Our IoT development platform and capabilities
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/development-process"
                          className="block p-3 space-y-1 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-[#1e40af]">Development Process</div>
                          <p className="text-sm text-gray-600">
                            5-phase approach from idea to market
                          </p>
                        </Link>
                      </li>
                      <li></li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/blog">
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isScrolled
                          ? "text-[#1e40af] hover:text-blue-600"
                          : "text-gray-200 hover:text-white bg-transparent hover:bg-white/20"
                      )}
                    >
                      News
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/careers">
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isScrolled
                          ? "text-[#1e40af] hover:text-blue-600"
                          : "text-gray-200 hover:text-white bg-transparent hover:bg-white/20"
                      )}
                    >
                      Careers
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors",
                      isScrolled
                        ? "bg-[#1e40af] text-white hover:bg-blue-900"
                        : "bg-[#1e40af] text-white hover:bg-blue-900"
                    )}
                  >
                    Contact Us
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={cn(
                "focus:outline-none",
                isScrolled ? "text-[#1e40af]" : "text-white"
              )}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Reduced height and simplified */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 overflow-hidden w-full",
          isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div
          className={cn(
            "px-3 pt-2 pb-3 space-y-1 shadow-sm overflow-y-auto max-h-80",
            isScrolled ? "bg-white border-t border-gray-200" : "bg-[#1e40af]/90 backdrop-blur-sm"
          )}
        >
          <Link
            to="/"
            className={cn(
              "block px-3 py-1.5 rounded-md text-sm transition-colors",
              isScrolled
                ? "text-[#1e40af] hover:bg-gray-50"
                : "text-gray-200 hover:bg-white/20"
            )}
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            Home
          </Link>

          <Link
            to="/about"
            className={cn(
              "block px-3 py-1.5 rounded-md text-sm transition-colors",
              isScrolled
                ? "text-[#1e40af] hover:bg-gray-50"
                : "text-gray-200 hover:bg-white/20"
            )}
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            About Us
          </Link>

          {/* Simplified Customer Cases - no dropdown */}
          <Link
            to="/projects/firecat"
            className={cn(
              "block px-3 py-1.5 rounded-md text-sm transition-colors",
              isScrolled
                ? "text-[#1e40af] hover:bg-gray-50"
                : "text-gray-200 hover:bg-white/20"
            )}
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            Customer Cases
          </Link>

          {/* Simplified Learn More - no dropdown */}
          <Link
            to="/tech-details"
            className={cn(
              "block px-3 py-1.5 rounded-md text-sm transition-colors",
              isScrolled
                ? "text-[#1e40af] hover:bg-gray-50"
                : "text-gray-200 hover:bg-white/20"
            )}
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            Learn More
          </Link>

          <Link
            to="/blog"
            className={cn(
              "block px-3 py-1.5 rounded-md text-sm transition-colors",
              isScrolled
                ? "text-[#1e40af] hover:bg-gray-50"
                : "text-gray-200 hover:bg-white/20"
            )}
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            News
          </Link>

          <Link
            to="/careers"
            className={cn(
              "block px-3 py-1.5 rounded-md text-sm transition-colors",
              isScrolled
                ? "text-[#1e40af] hover:bg-gray-50"
                : "text-gray-200 hover:bg-white/20"
            )}
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}
          >
            Careers
          </Link>

          <button
            onClick={() => scrollToSection("contact")}
            className={cn(
              "block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
              isScrolled
                ? "text-white bg-[#1e40af] hover:bg-blue-900"
                : "text-white bg-[#1e40af] hover:bg-blue-900"
            )}
          >
            Contact Us
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
