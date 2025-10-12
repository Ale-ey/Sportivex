import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Calendar,
  Waves,
  Bell,
  CreditCard,
  Users,
  Activity,
  Trophy,
  Dumbbell,
  MessageCircle,
  Home,
  Target,
  Clock,
  Search,
  Filter,
  Award,
  Heart,
  Play,
} from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../components/ui/popover";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");

  // logout handled elsewhere (no direct button on header)

  // Navigation tabs
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "sports", label: "Sports", icon: Activity },
    { id: "leagues", label: "Leagues", icon: Trophy },
    { id: "training", label: "Training", icon: Target },
    { id: "ai-chat", label: "AI Chat", icon: MessageCircle },
  ];

  // Athlete progress stats
  const stats = [
    {
      title: "Workouts This Week",
      value: "8",
      icon: Dumbbell,
      color: "bg-[#0077B6]",
      change: "+2",
    },
    {
      title: "Calories Burned",
      value: "2,450",
      icon: Heart,
      color: "bg-[#0096C7]",
      change: "+15%",
    },
    {
      title: "Training Hours",
      value: "12.5",
      icon: Clock,
      color: "bg-[#023E8A]",
      change: "+3.2h",
    },
    {
      title: "Achievements",
      value: "5",
      icon: Award,
      color: "bg-[#00B4D8]",
      change: "+1",
    },
  ];

  // Sports activities with athlete progress
  const sports = [
    {
      name: "Swimming",
      icon: Waves,
      color: "bg-[#00B4D8]",
      image: "/swiming.jpg",
      progress: 85,
      sessions: 12,
      lastSession: "2 hours ago",
    },
    {
      name: "Gym Training",
      icon: Dumbbell,
      color: "bg-[#0077B6]",
      image: "/gym.jpg",
      progress: 92,
      sessions: 8,
      lastSession: "1 day ago",
    },
    {
      name: "Horse Riding",
      icon: Activity,
      color: "bg-[#023E8A]",
      image: undefined,
      progress: 68,
      sessions: 4,
      lastSession: "3 days ago",
    },
    {
      name: "Badminton",
      icon: Activity,
      color: "bg-[#0096C7]",
      image: "/badminton.jpg",
      progress: 78,
      sessions: 6,
      lastSession: "1 day ago",
    },
    {
      name: "Tennis",
      icon: Trophy,
      color: "bg-[#0077B6]",
      image: undefined,
      progress: 45,
      sessions: 3,
      lastSession: "1 week ago",
    },
    {
      name: "Basketball",
      icon: Target,
      color: "bg-[#023E8A]",
      image: undefined,
      progress: 73,
      sessions: 5,
      lastSession: "2 days ago",
    },
  ];

  // Competitions and leagues
  const leagues = [
    {
      name: "Summer Swimming Championship",
      date: "Aug 15, 2024",
      participants: 45,
      status: "Registered",
      prize: "$5,000",
      myRank: 12,
    },
    {
      name: "Gym Strength Competition",
      date: "Aug 20, 2024",
      participants: 32,
      status: "Training",
      prize: "$3,000",
      myRank: 8,
    },
    {
      name: "Horse Riding Show",
      date: "Aug 25, 2024",
      participants: 18,
      status: "Upcoming",
      prize: "$2,500",
      myRank: null,
    },
    {
      name: "Badminton Tournament",
      date: "Sep 1, 2024",
      participants: 28,
      status: "Registration Open",
      prize: "$1,500",
      myRank: null,
    },
  ];

  // Training programs with athlete enrollment
  const trainingPrograms = [
    {
      name: "Advanced Swimming Technique",
      instructor: "Sarah Johnson",
      duration: "8 weeks",
      level: "Advanced",
      progress: 75,
      enrolled: true,
    },
    {
      name: "Strength & Conditioning",
      instructor: "Mike Chen",
      duration: "12 weeks",
      level: "Intermediate",
      progress: 60,
      enrolled: true,
    },
    {
      name: "Horse Riding Mastery",
      instructor: "Emma Wilson",
      duration: "6 weeks",
      level: "Beginner",
      progress: 0,
      enrolled: false,
    },
    {
      name: "Tennis Fundamentals",
      instructor: "David Lee",
      duration: "10 weeks",
      level: "Intermediate",
      progress: 0,
      enrolled: false,
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      activity: "Morning Swim",
      time: "Today, 7:00 AM",
      duration: "45 min",
      calories: 320,
      status: "completed",
    },
    {
      activity: "Gym Training",
      time: "Yesterday, 6:00 PM",
      duration: "1h 15min",
      calories: 450,
      status: "completed",
    },
    {
      activity: "Badminton Practice",
      time: "Yesterday, 4:00 PM",
      duration: "1h 30min",
      calories: 280,
      status: "completed",
    },
    {
      activity: "Horse Riding Lesson",
      time: "Monday, 10:00 AM",
      duration: "2h",
      calories: 180,
      status: "completed",
    },
  ];

  // Upcoming events
  const upcomingEvents = [
    {
      event: "Swimming Championship",
      date: "Saturday, 2:00 PM",
      type: "Competition",
      status: "registered",
    },
    {
      event: "Gym Training Session",
      date: "Tomorrow, 8:00 AM",
      type: "Training",
      status: "scheduled",
    },
    {
      event: "Horse Riding Lesson",
      date: "Monday, 10:00 AM",
      type: "Training",
      status: "scheduled",
    },
    {
      event: "Badminton Tournament",
      date: "Next Saturday, 3:00 PM",
      type: "Competition",
      status: "registered",
    },
  ];

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold mb-2">
                    Track Your Athletic Journey
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Monitor your progress and achieve your fitness goals
                  </p>
                  <div className="mt-6 flex space-x-4">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg">
                      <Play className="w-4 h-4 mr-2" />
                      Start Workout
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-400 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-lg"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Today's Date</p>
                  <p className="text-2xl font-bold">6 Aug 2024, 07:20am</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`p-3 rounded-lg bg-gray-700 ${stat.color}`}
                        >
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-400">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          stat.change.startsWith("+")
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Recent Activities
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your latest training sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.slice(0, 3).map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {activity.activity}
                            </p>
                            <p className="text-sm text-gray-400">
                              {activity.time} • {activity.duration}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-green-400 font-medium">
                            {activity.calories} cal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Upcoming Events</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your scheduled competitions and training
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.slice(0, 3).map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 ${
                              event.type === "Competition"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            } rounded-lg flex items-center justify-center mr-3`}
                          >
                            {event.type === "Competition" ? (
                              <Trophy className="w-5 h-5 text-white" />
                            ) : (
                              <Target className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {event.event}
                            </p>
                            <p className="text-sm text-gray-400">
                              {event.date}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            event.status === "registered"
                              ? "text-blue-400"
                              : "text-green-400"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "sports":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">
                Sports Activities
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {sports.map((sport, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden rounded-lg transition-all cursor-pointer h-64"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={
                      sport.image
                        ? { backgroundImage: `url(${sport.image})` }
                        : { backgroundColor: "#1f2937" }
                    }
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    aria-hidden
                  />
                  <CardContent className="relative p-6 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                          <sport.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-white text-lg">
                          {sport.name}
                        </h3>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {sport.progress}%
                        </p>
                        <p className="text-sm text-gray-200/70">Progress</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${sport.color}`}
                          style={{ width: `${sport.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-200/80">
                      <span>{sport.sessions} sessions</span>
                      <span className="text-gray-200/60">
                        {sport.lastSession}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "leagues":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">
                Competitions & Leagues
              </h2>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                + Join Competition
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {leagues.map((league, index) => (
                <Card
                  key={index}
                  className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          {league.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          {league.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          {league.participants} participants
                        </div>
                        {league.myRank && (
                          <div className="flex items-center text-sm text-blue-400 mt-2">
                            <Trophy className="w-4 h-4 mr-2" />
                            Your Rank: #{league.myRank}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            league.status === "Registered"
                              ? "bg-green-900 text-green-300"
                              : league.status === "Training"
                              ? "bg-blue-900 text-blue-300"
                              : league.status === "Upcoming"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {league.status}
                        </span>
                        <p className="text-lg font-bold text-white mt-2">
                          {league.prize}
                        </p>
                        <p className="text-sm text-gray-400">Prize Pool</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {league.status === "Registration Open"
                          ? "Register"
                          : "View Details"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "training":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">
                Training Programs
              </h2>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                + Enroll in Program
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trainingPrograms.map((program, index) => (
                <Card
                  key={index}
                  className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          {program.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <Users className="w-4 h-4 mr-2" />
                          Instructor: {program.instructor}
                        </div>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          Duration: {program.duration}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Target className="w-4 h-4 mr-2" />
                          Level: {program.level}
                        </div>
                        {program.enrolled && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{program.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${program.progress}%`,
                                  background:
                                    "linear-gradient(90deg,#0077B6,#00B4D8)",
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            program.level === "Beginner"
                              ? "bg-green-900 text-green-300"
                              : program.level === "Intermediate"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {program.level}
                        </span>
                        <p className="text-lg font-bold text-white mt-2">
                          {program.enrolled ? "Enrolled" : "Available"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {program.enrolled
                            ? "In Progress"
                            : "Open for Enrollment"}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {program.enrolled ? "Continue" : "Enroll Now"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "ai-chat":
        return (
          <div className="space-y-6">
            <div className="h-[calc(100vh-9rem)] rounded-lg overflow-hidden shadow-lg">
              <div
                className="h-full p-6 flex flex-col"
                style={{
                  background:
                    "linear-gradient(180deg, #023E8A 0%, #0077B6 50%, #00B4D8 100%)",
                }}
              >
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-semibold text-white">
                    AI Assistant
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                  {/* Assistant message */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white/90" />
                    </div>
                    <div className="max-w-2xl bg-white/8 border border-white/6 rounded-lg p-4 text-white text-sm shadow-sm">
                      <p>
                        Hello! I can help with training plans, technique tips,
                        or nutrition. What would you like to discuss today?
                      </p>
                    </div>
                  </div>

                  {/* User reply */}
                  <div className="flex items-start justify-end space-x-3">
                    <div className="max-w-2xl bg-white/12 rounded-lg p-3 text-white text-sm shadow-sm text-right">
                      <p>
                        Where are some good places to get pad thai in Toronto?
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white/90" />
                    </div>
                  </div>

                  {/* Assistant long reply */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white/90" />
                    </div>
                    <div className="max-w-3xl bg-white/8 border border-white/6 rounded-lg p-4 text-white text-sm shadow-sm">
                      <ol className="list-decimal ml-5 space-y-2">
                        <li>
                          Pai Northern Thai Kitchen - authentic northern Thai
                          flavors.
                        </li>
                        <li>
                          Sabai Sabai Kitchen and Bar - traditional Thai dishes.
                        </li>
                        <li>
                          Sukhothai - multiple locations, popular pad thai.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="bg-white/6 rounded-full p-2 flex items-center space-x-3">
                    <input
                      className="flex-1 bg-transparent placeholder-white/60 text-white text-sm px-3 py-2 focus:outline-none"
                      placeholder="Ask me anything..."
                    />
                    <Button className="bg-[#0077B6] hover:bg-[#0096C7] text-white px-4 py-2 rounded-full">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Account Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Change Password</p>
                      <p className="text-sm text-gray-400">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      Change
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-400">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Login Sessions</p>
                      <p className="text-sm text-gray-400">
                        Manage active sessions
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900 shadow-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 justify-between">
            {/* Left: Brand */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Sportivex</h1>
            </div>

            {/* Center: Pill navigation */}
            <div className="flex-1 flex justify-center">
              <nav className="inline-flex items-center space-x-2 bg-gray-800/60 px-2 py-2 rounded-full shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "text-white shadow-md"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/60"
                    }`}
                    style={
                      activeTab === tab.id
                        ? {
                            background:
                              "linear-gradient(90deg, #0077B6 0%, #00B4D8 100%)",
                          }
                        : undefined
                    }
                  >
                    <tab.icon className="w-4 h-4 text-white" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-full">
                  3
                </span>
              </button>
              <button className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300">
                <CreditCard className="w-4 h-4" />
              </button>
              <div className="ml-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="rounded-full focus:outline-none">
                      <Avatar>
                        <AvatarImage src="/Ali.jpg" alt="User avatar" />
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-700">
                        Profile
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-700">
                        Settings
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-700">
                        Billing
                      </button>
                      <div className="border-t border-gray-700" />
                      <button className="w-full text-left px-3 py-2 rounded-md hover:bg-red-700 text-red-400">
                        Logout
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;
