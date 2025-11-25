import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

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
  const { logout, isLoading } = useLogout();
  const { getProfile, user } = useGetProfile();

  // Fetch profile on mount
  useEffect(() => {
    getProfile();
  }, [getProfile]);

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

  return (
    <header className="bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 justify-between">
          {/* Left: Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-[#023E8A]">Sportivex</h1>
          </div>

          {/* Center: Navigation (shadcn NavigationMenu) */}
          <div className="flex-1 flex justify-center">
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
    </header>
  );
};

export default DashboardHeader;
