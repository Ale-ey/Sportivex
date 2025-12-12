import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import {
  Waves,
  Dumbbell,
  Target,
  Zap,
  TrendingUp,
  Trophy,
  Bike,
  Footprints,
  Users,
} from "lucide-react";

const SportsNavigation: React.FC = () => {
  const sportsModules = [
    {
      title: "Swimming",
      description:
        "Pool management, time slots, training sessions, and aquatic fitness programs",
      icon: Waves,
      link: "/swimming/registration",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      imageUrl: "/swiming.jpg",
      features: [
        "Pool Booking",
        "Swimming Lessons",
        "Water Aerobics",
        "Lifeguard Training",
        "Competition Events",
      ],
    },
    {
      title: "Gym & Fitness",
      description:
        "Comprehensive fitness center with modern equipment and personalized training programs",
      icon: Dumbbell,
      link: "/gym",
      color: "bg-gradient-to-br from-green-400 to-green-600",
      imageUrl: "/gym.jpg",
      features: [
        "Equipment Access",
        "Personal Training",
        "Group Classes",
        "Nutrition Counseling",
        "Fitness Assessment",
      ],
    },
    {
      title: "Badminton",
      description:
        "Professional badminton courts with coaching and tournament management",
      icon: Target,
      link: "/badminton",
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
      imageUrl: "/badminton.jpg",
      features: [
        "Court Booking",
        "Coaching Sessions",
        "Tournament Play",
        "Equipment Rental",
        "Skill Development",
      ],
    },
    {
      title: "Horse Riding",
      description:
        "Equestrian center with professional riding lessons and horse care programs",
      icon: Users,
      link: "/horse-riding",
      color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      imageUrl: "/horse-riding.jpg",
      features: [
        "Riding Lessons",
        "Horse Care",
        "Trail Rides",
        "Competition Training",
        "Stable Management",
      ],
    },
    {
      title: "Wall Climbing",
      description:
        "Indoor and outdoor climbing walls with safety equipment and expert guidance",
      icon: TrendingUp,
      link: "/wall-climbing",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
      imageUrl: "/wall-climbing.jpg",
      features: [
        "Climbing Routes",
        "Safety Training",
        "Equipment Rental",
        "Skill Workshops",
        "Competition Climbing",
      ],
    },
    // {
    //   title: "Paddle Sports",
    //   description:
    //     "Kayaking, canoeing, and paddleboarding with water safety programs",
    //   icon: Anchor,
    //   link: "/paddle-sports",
    //   color: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    //   imageUrl: "/paddle-sports.jpg",
    //   features: [
    //     "Kayaking",
    //     "Canoeing",
    //     "Paddleboarding",
    //     "Water Safety",
    //     "Guided Tours",
    //   ],
    // },
    {
      title: "Squash",
      description:
        "Professional squash courts with coaching and league management",
      icon: Zap,
      link: "/squash",
      color: "bg-gradient-to-br from-red-400 to-red-600",
      imageUrl: "/squash.jpg",
      features: [
        "Court Booking",
        "Coaching Programs",
        "League Play",
        "Equipment Rental",
        "Tournament Events",
      ],
    },
    {
      title: "Marathon Training",
      description:
        "Endurance training programs for marathon and long-distance running events",
      icon: Trophy,
      link: "/marathon",
      color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      imageUrl: "/marathon.jpg",
      features: [
        "Training Plans",
        "Nutrition Guidance",
        "Injury Prevention",
        "Race Preparation",
        "Group Training",
      ],
    },
    {
      title: "Cycling",
      description:
        "Indoor and outdoor cycling programs with bike maintenance and safety training",
      icon: Bike,
      link: "/cycling",
      color: "bg-gradient-to-br from-teal-400 to-teal-600",
      imageUrl: "/cycling.jpg",
      features: [
        "Bike Rental",
        "Cycling Tours",
        "Maintenance Classes",
        "Safety Training",
        "Group Rides",
      ],
    },
    {
      title: "Running",
      description:
        "Track and trail running programs with coaching and fitness tracking",
      icon: Footprints,
      link: "/running",
      color: "bg-gradient-to-br from-pink-400 to-pink-600",
      imageUrl: "/running.jpg",
      features: [
        "Track Access",
        "Running Clubs",
        "Fitness Tracking",
        "Coaching",
        "Race Training",
      ],
    },
    // {
    //   title: "Bowling",
    //   description:
    //     "Professional bowling lanes with league play and tournament management",
    //   icon: CircleDot,
    //   link: "/bowling",
    //   color: "bg-gradient-to-br from-amber-400 to-amber-600",
    //   imageUrl: "/bowling.jpg",
    //   features: [
    //     "Lane Booking",
    //     "League Play",
    //     "Tournament Events",
    //     "Equipment Rental",
    //     "Coaching",
    //   ],
    // },
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1e40af] mb-4">
            NUST University Sports Modules
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive sports management system for all university activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sportsModules.map((module, index) => (
            <Link key={index} to={module.link} className="h-full">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col border border-gray-200 hover:border-[#1e40af] hover:shadow-[#1e40af]/20 overflow-hidden">
                {/* Colorful Header with Image */}
                <div
                  className={`${module.color} p-4 text-white relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">
                          {module.title}
                        </h3>
                        <p className="text-white/90 text-sm">NUST Sports</p>
                      </div>
                    </div>
                  </div>
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-30">
                    <img
                      src={module.imageUrl}
                      alt={module.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col h-full bg-white">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                      <div className="w-2 h-2 bg-[#1e40af] rounded-full mr-2"></div>
                      Key Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {module.features.slice(0, 4).map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gradient-to-r from-[#1e40af]/10 to-[#1e40af]/5 text-[#1e40af] text-xs rounded-full border border-[#1e40af]/20 font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                      {module.features.length > 4 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          +{module.features.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Available Now
                      </span>
                      <div className="flex items-center text-[#1e40af] font-semibold text-sm">
                        Explore
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportsNavigation;
