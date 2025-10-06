import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  User, 
  Calendar, 
  Waves, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Bell,
  CreditCard,
  Users,
  Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
  };

  const stats = [
    { title: 'Active Memberships', value: '3', icon: Users, color: 'text-blue-600' },
    { title: 'Upcoming Sessions', value: '12', icon: Calendar, color: 'text-green-600' },
    { title: 'Monthly Fees', value: '$150', icon: CreditCard, color: 'text-purple-600' },
    { title: 'Total Activities', value: '45', icon: Activity, color: 'text-orange-600' },
  ];

  const quickActions = [
    { title: 'Swimming Pool', icon: Waves, link: '/swimming/registration', color: 'bg-blue-500' },
    { title: 'Gym Training', icon: Activity, link: '/gym', color: 'bg-green-500' },
    { title: 'Sports Events', icon: Calendar, link: '/sports/events', color: 'bg-purple-500' },
    { title: 'Badminton', icon: Users, link: '/badminton', color: 'bg-orange-500' },
    { title: 'Squash', icon: Activity, link: '/squash', color: 'bg-red-500' },
    { title: 'Bowling', icon: Users, link: '/bowling', color: 'bg-yellow-500' },
    { title: 'Horse Riding', icon: Activity, link: '/horse-riding', color: 'bg-indigo-500' },
    { title: 'Sports Shop', icon: ShoppingCart, link: '/swimming/shop', color: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sportivex Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h2>
          <p className="text-gray-600">Here's what's happening with your sports activities today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Sports Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Swimming Sessions</CardTitle>
              <CardDescription>Your latest swimming activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Waves className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">Morning Swim</p>
                      <p className="text-sm text-gray-600">Today, 7:00 AM</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Completed</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Waves className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">Evening Swim</p>
                      <p className="text-sm text-gray-600">Tomorrow, 6:00 PM</p>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">Scheduled</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Your scheduled sports events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Badminton Tournament</p>
                      <p className="text-sm text-gray-600">Saturday, 2:00 PM</p>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">Registered</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Gym Training</p>
                      <p className="text-sm text-gray-600">Monday, 8:00 AM</p>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">Scheduled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
