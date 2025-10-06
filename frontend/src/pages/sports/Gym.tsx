import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dumbbell, Users, Clock, Calendar } from 'lucide-react';

const Gym: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Dumbbell className="w-10 h-10 mr-3 text-green-600" />
            Gym Training Module
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive gym management and training programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Booking</CardTitle>
              <CardDescription>Book gym equipment and machines</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Reserve gym equipment for your workout sessions.</p>
              <Button className="w-full">Book Equipment</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Training</CardTitle>
              <CardDescription>Book sessions with personal trainers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Get personalized training from certified trainers.</p>
              <Button className="w-full">Book Training</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Membership</CardTitle>
              <CardDescription>Manage your gym membership</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and manage your gym membership details.</p>
              <Button className="w-full">View Membership</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Gym;
