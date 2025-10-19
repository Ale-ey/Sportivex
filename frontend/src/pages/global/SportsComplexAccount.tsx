import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { 
  Building, 
   
  Phone, 
   
  Users, 
  
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const sportsComplexSchema = z.object({
  complexName: z.string().min(2, 'Complex name must be at least 2 characters'),
  address: z.string().min(10, 'Please enter a complete address'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Please enter a valid zip code'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  capacity: z.string().min(1, 'Capacity is required'),
  facilities: z.string().min(10, 'Please describe the facilities'),
  operatingHours: z.string().min(5, 'Please enter operating hours'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  contactPhone: z.string().min(10, 'Please enter a valid contact phone'),
});

type SportsComplexFormData = z.infer<typeof sportsComplexSchema>;

const SportsComplexAccount: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SportsComplexFormData>({
    resolver: zodResolver(sportsComplexSchema),
  });

  const onSubmit = async (data: SportsComplexFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Sports complex registration data:', data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your sports complex account has been created successfully. Our team will review your application and contact you within 24-48 hours.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
                    Create Another Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sports Complex Registration</h1>
            <p className="text-xl text-gray-600">
              Create your sports complex account and start managing your facility
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complex Information</CardTitle>
            <CardDescription>
              Please provide detailed information about your sports complex
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="complexName">Complex Name *</Label>
                  <Input
                    id="complexName"
                    placeholder="Enter complex name"
                    {...register('complexName')}
                  />
                  {errors.complexName && (
                    <p className="text-sm text-red-600">{errors.complexName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      {...register('state')}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete address"
                    rows={3}
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    placeholder="Enter zip code"
                    {...register('zipCode')}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-600">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Enter contact person name"
                      {...register('contactPerson')}
                    />
                    {errors.contactPerson && (
                      <p className="text-sm text-red-600">{errors.contactPerson.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="Enter contact phone"
                      {...register('contactPhone')}
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-red-600">{errors.contactPhone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Facility Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Facility Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Maximum Capacity *</Label>
                  <Input
                    id="capacity"
                    placeholder="Enter maximum capacity"
                    {...register('capacity')}
                  />
                  {errors.capacity && (
                    <p className="text-sm text-red-600">{errors.capacity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilities">Facilities & Amenities *</Label>
                  <Textarea
                    id="facilities"
                    placeholder="Describe all facilities and amenities available"
                    rows={4}
                    {...register('facilities')}
                  />
                  {errors.facilities && (
                    <p className="text-sm text-red-600">{errors.facilities.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours *</Label>
                  <Input
                    id="operatingHours"
                    placeholder="e.g., 6:00 AM - 10:00 PM"
                    {...register('operatingHours')}
                  />
                  {errors.operatingHours && (
                    <p className="text-sm text-red-600">{errors.operatingHours.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SportsComplexAccount;
