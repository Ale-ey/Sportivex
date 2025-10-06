import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search, 
  Filter,
  Star,
  Trophy,
  Badge
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  participants: number;
  maxParticipants: number;
  price: number;
  image: string;
  featured: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const events: Event[] = [
    {
      id: '1',
      title: 'Summer Swimming Championship',
      description: 'Annual swimming competition for all age groups',
      date: '2024-07-15',
      time: '09:00 AM',
      location: 'Olympic Swimming Pool',
      category: 'Swimming',
      participants: 45,
      maxParticipants: 100,
      price: 25,
      image: '/swiming.jpg',
      featured: true,
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Badminton Tournament',
      description: 'Weekly badminton tournament for intermediate players',
      date: '2024-06-20',
      time: '06:00 PM',
      location: 'Sports Complex Court 1',
      category: 'Badminton',
      participants: 24,
      maxParticipants: 32,
      price: 15,
      image: '/badminton.jpg',
      featured: false,
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Gym Fitness Challenge',
      description: 'Monthly fitness challenge with prizes',
      date: '2024-06-25',
      time: '07:00 AM',
      location: 'Main Gymnasium',
      category: 'Gym',
      participants: 18,
      maxParticipants: 50,
      price: 20,
      image: '/gym.jpg',
      featured: true,
      status: 'upcoming'
    },
    {
      id: '4',
      title: 'Bowling League',
      description: 'Weekly bowling league for all skill levels',
      date: '2024-06-18',
      time: '07:30 PM',
      location: 'Bowling Alley',
      category: 'Bowling',
      participants: 12,
      maxParticipants: 16,
      price: 18,
      image: '/bowling.jpg',
      featured: false,
      status: 'ongoing'
    }
  ];

  const categories = ['all', 'Swimming', 'Badminton', 'Gym', 'Bowling', 'Tennis', 'Basketball'];
  const statuses = ['all', 'upcoming', 'ongoing', 'completed'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Swimming': return '🏊‍♂️';
      case 'Badminton': return '🏸';
      case 'Gym': return '💪';
      case 'Bowling': return '🎳';
      default: return '🏆';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sports Events</h1>
            <p className="text-xl text-gray-600">
              Discover and participate in exciting sports events at our complex
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {statuses.slice(1).map(status => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Events */}
        {filteredEvents.filter(event => event.featured).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Featured Events
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents
                .filter(event => event.featured)
                .map(event => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{getCategoryIcon(event.category)}</span>
                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {event.participants}/{event.maxParticipants} participants
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">${event.price}</span>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Register Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">{getCategoryIcon(event.category)}</span>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="w-3 h-3 mr-1" />
                      {event.participants}/{event.maxParticipants}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">${event.price}</span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* No Events Message */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
