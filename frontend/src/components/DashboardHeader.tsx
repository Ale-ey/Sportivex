import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useLogout, useGetProfile } from "@/hooks/useAuth";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface DashboardHeaderProps {
  items: NavItem[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ items }) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, isLoading } = useLogout();
  const { getProfile, user } = useGetProfile();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch profile on mount (only if token exists)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      getProfile();
    }
  }, [getProfile]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  // Helper function to get initials from name
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleNavClick = (to: string) => {
    navigate(to);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 justify-between">
            {/* Left: Brand + Mobile Menu Button */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button - visible only on < md */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#023E8A]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#023E8A]" />
                )}
              </button>
            <h1 className="text-2xl font-bold text-[#023E8A]">Sportivex</h1>
          </div>

            {/* Center: Navigation (shadcn NavigationMenu) - hidden on mobile */}
            <div className="hidden md:flex flex-1 justify-center">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="bg-[#EAF7FD] px-2 rounded-full border border-[#ADE8F4]">
                {items.map((item) => (
                  <NavigationMenuItem key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isActive
                            ? "text-white shadow bg-gradient-to-r from-[#0077B6] to-[#00B4D8]"
                            : "text-[#0077B6] hover:text-white hover:shadow hover:bg-gradient-to-r hover:from-[#0096C7] hover:to-[#00B4D8]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <NavigationMenuLink className="bg-transparent p-0 rounded-full hover:bg-transparent focus:bg-transparent data-[active=true]:bg-transparent pointer-events-none">
                          <item.icon
                            className={
                              "w-4 h-4  hover:text-white" +
                              (isActive
                                ? "text-white"
                                : "text-[#0077B6] hover:text-white ")
                            }
                          />
                          <span
                            className={"hover:text-white" + (
                              isActive ? "text-white" : "text-[#0077B6] hover:text-white")
                            }
                          >
                            {item.label}
                          </span>
                        </NavigationMenuLink>
                      )}
                    </NavLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            <div className="ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none">
                    <Avatar>
                      <AvatarImage 
                        src={user?.profilePictureUrl || undefined} 
                        alt={user?.name || "User avatar"} 
                      />
                      <AvatarFallback>
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-white border border-slate-200 text-slate-700"
                >
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NavLink to="/dashboard/profile" className="w-full">
                      Profile
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/dashboard/settings" className="w-full">
                      Settings
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/dashboard/billing" className="w-full">
                      Billing
                    </NavLink>
                  </DropdownMenuItem>
                  {user?.role?.toLowerCase()?.trim() === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <NavLink to="/dashboard/admin" className="w-full font-semibold text-[#023E8A]">
                          Admin Panel
                        </NavLink>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-rose-600 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowLogoutDialog(true);
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isLoading ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Sidebar - slides from left */}
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-[60] transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-[#023E8A]">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-[#023E8A]" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <button
                    key={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white shadow-md"
                        : "text-[#0077B6] hover:bg-[#EAF7FD]"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive ? "text-white" : "text-[#0077B6]"
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User Info at Bottom */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarImage
                  src={user?.profilePictureUrl || undefined}
                  alt={user?.name || "User avatar"}
                />
                <AvatarFallback>
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowLogoutDialog(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
