import React from "react";
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

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface DashboardHeaderProps {
  items: NavItem[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ items }) => {
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
                      <AvatarImage src="/Ali.jpg" alt="User avatar" />
                      <AvatarFallback>AJ</AvatarFallback>
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
                  <DropdownMenuItem className="text-rose-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
