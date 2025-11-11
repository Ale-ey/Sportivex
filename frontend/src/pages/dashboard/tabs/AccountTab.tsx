import React from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const AccountTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Account Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
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
            <CardTitle className="text-white">Security Settings</CardTitle>
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
                <p className="text-sm text-gray-400">Manage active sessions</p>
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
};

export default AccountTab;
