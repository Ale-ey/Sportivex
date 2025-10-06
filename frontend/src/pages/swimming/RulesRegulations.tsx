import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

import { Badge } from '../../components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Clock,
  Droplets,
  


  BookOpen,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';

interface Rule {
  id: string;
  category: string;
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  mandatory: boolean;
  penalty?: string;
}

const RulesRegulations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImportance, setSelectedImportance] = useState('all');

  const rules: Rule[] = [
    {
      id: '1',
      category: 'Safety',
      title: 'No Running Around Pool',
      description: 'Running around the pool area is strictly prohibited to prevent slips and falls. Walk at all times.',
      importance: 'high',
      mandatory: true,
      penalty: 'Warning or temporary suspension'
    },
    {
      id: '2',
      category: 'Safety',
      title: 'Shower Before Entering',
      description: 'All swimmers must shower before entering the pool to maintain water hygiene and cleanliness.',
      importance: 'high',
      mandatory: true,
      penalty: 'Denied pool access'
    },
    {
      id: '3',
      category: 'Safety',
      title: 'No Diving in Shallow End',
      description: 'Diving is only allowed in designated deep water areas. No diving in water less than 5 feet deep.',
      importance: 'high',
      mandatory: true,
      penalty: 'Immediate removal from pool'
    },
    {
      id: '4',
      category: 'Hygiene',
      title: 'Proper Swimwear Required',
      description: 'Only appropriate swimwear is allowed. No street clothes, jeans, or non-swimming attire in the pool.',
      importance: 'medium',
      mandatory: true,
      penalty: 'Change of attire required'
    },
    {
      id: '5',
      category: 'Hygiene',
      title: 'No Food or Drinks in Pool',
      description: 'Food and drinks are not allowed in the pool area. Use designated eating areas only.',
      importance: 'medium',
      mandatory: true,
      penalty: 'Removal of items and warning'
    },
    {
      id: '6',
      category: 'Hygiene',
      title: 'Clean Up After Use',
      description: 'All users must clean up their area after use, including disposing of trash and returning equipment.',
      importance: 'medium',
      mandatory: true,
      penalty: 'Additional cleaning fees'
    },
    {
      id: '7',
      category: 'Equipment',
      title: 'Proper Use of Equipment',
      description: 'Use all pool equipment as intended. Do not misuse or damage any equipment or facilities.',
      importance: 'high',
      mandatory: true,
      penalty: 'Equipment replacement costs'
    },
    {
      id: '8',
      category: 'Equipment',
      title: 'Return Equipment After Use',
      description: 'All borrowed equipment must be returned to designated areas after use.',
      importance: 'medium',
      mandatory: true,
      penalty: 'Equipment rental suspension'
    },
    {
      id: '9',
      category: 'Behavior',
      title: 'Respectful Behavior',
      description: 'All users must maintain respectful behavior towards staff and other members at all times.',
      importance: 'high',
      mandatory: true,
      penalty: 'Warning or membership suspension'
    },
    {
      id: '10',
      category: 'Behavior',
      title: 'No Loud Music',
      description: 'Personal music devices must be used with headphones. No loud music or noise disturbances.',
      importance: 'low',
      mandatory: false,
      penalty: 'Request to lower volume'
    },
    {
      id: '11',
      category: 'Time',
      title: 'Session Time Limits',
      description: 'Each swimming session is limited to 2 hours during peak hours and 3 hours during off-peak hours.',
      importance: 'medium',
      mandatory: true,
      penalty: 'Additional session fees'
    },
    {
      id: '12',
      category: 'Time',
      title: 'Arrive on Time',
      description: 'Members must arrive within 15 minutes of their scheduled session time or forfeit their slot.',
      importance: 'medium',
      mandatory: true,
      penalty: 'Session cancellation'
    },
    {
      id: '13',
      category: 'Health',
      title: 'Health Declaration',
      description: 'Members with contagious illnesses must not use the pool until fully recovered.',
      importance: 'high',
      mandatory: true,
      penalty: 'Temporary membership suspension'
    },
    {
      id: '14',
      category: 'Health',
      title: 'Report Injuries',
      description: 'All injuries must be reported to staff immediately, no matter how minor.',
      importance: 'high',
      mandatory: true,
      penalty: 'N/A'
    },
    {
      id: '15',
      category: 'Access',
      title: 'Valid Membership Required',
      description: 'All users must present valid membership card or ID for pool access.',
      importance: 'high',
      mandatory: true,
      penalty: 'Access denied'
    }
  ];

  const categories = ['all', 'Safety', 'Hygiene', 'Equipment', 'Behavior', 'Time', 'Health', 'Access'];
  const importanceLevels = ['all', 'high', 'medium', 'low'];

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    const matchesImportance = selectedImportance === 'all' || rule.importance === selectedImportance;
    
    return matchesSearch && matchesCategory && matchesImportance;
  });

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Safety': return <Shield className="w-4 h-4" />;
      case 'Hygiene': return <Droplets className="w-4 h-4" />;
      case 'Equipment': return <Users className="w-4 h-4" />;
      case 'Behavior': return <Users className="w-4 h-4" />;
      case 'Time': return <Clock className="w-4 h-4" />;
      case 'Health': return <Shield className="w-4 h-4" />;
      case 'Access': return <CheckCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getMandatoryIcon = (mandatory: boolean) => {
    return mandatory ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <BookOpen className="w-10 h-10 mr-3 text-blue-600" />
              Swimming Pool Rules & Regulations
            </h1>
            <p className="text-xl text-gray-600">
              Important guidelines for safe and enjoyable swimming experience
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
                <input
                  type="text"
                  placeholder="Search rules and regulations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={selectedImportance}
                onChange={(e) => setSelectedImportance(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Importance</option>
                {importanceLevels.slice(1).map(level => (
                  <option key={level} value={level} className="capitalize">{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Important Notice</h3>
                <p className="text-red-800">
                  All members and guests must comply with these rules and regulations. 
                  Violations may result in warnings, temporary suspension, or permanent 
                  membership termination. Safety is our top priority.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRules.map(rule => (
            <Card key={rule.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getCategoryIcon(rule.category)}
                    <span className="ml-2 text-sm font-medium text-gray-600">{rule.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getImportanceColor(rule.importance)}>
                      {rule.importance}
                    </Badge>
                    {getMandatoryIcon(rule.mandatory)}
                  </div>
                </div>
                <CardTitle className="text-lg">{rule.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{rule.description}</p>
                {rule.penalty && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Penalty:</h4>
                    <p className="text-gray-700 text-sm">{rule.penalty}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Rules Message */}
        {filteredRules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rules Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Rules Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
                <div className="text-sm text-gray-600">Total Rules</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {rules.filter(rule => rule.importance === 'high').length}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {rules.filter(rule => rule.mandatory).length}
                </div>
                <div className="text-sm text-gray-600">Mandatory</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(rules.map(rule => rule.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Questions About Rules?</CardTitle>
            <CardDescription>
              If you have any questions about these rules and regulations, please contact our staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">Pool Manager</h4>
                <p className="text-gray-600">manager@sportivex.com</p>
                <p className="text-gray-600">(555) 123-4567</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">Safety Officer</h4>
                <p className="text-gray-600">safety@sportivex.com</p>
                <p className="text-gray-600">(555) 123-4568</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">General Inquiries</h4>
                <p className="text-gray-600">info@sportivex.com</p>
                <p className="text-gray-600">(555) 123-4569</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RulesRegulations;
