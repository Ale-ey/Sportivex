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
  Waves, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const swimmingRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  emergencyContact: z.string().min(2, 'Emergency contact name is required'),
  emergencyPhone: z.string().min(10, 'Please enter a valid emergency phone'),
  medicalConditions: z.string().optional(),
  swimmingLevel: z.string().min(1, 'Please select your swimming level'),
  preferredTimeSlots: z.array(z.string()).min(1, 'Please select at least one time slot'),
  membershipType: z.string().min(1, 'Please select a membership type'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
});

type SwimmingRegistrationFormData = z.infer<typeof swimmingRegistrationSchema>;

const SwimmingRegistration: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<SwimmingRegistrationFormData>({
    resolver: zodResolver(swimmingRegistrationSchema),
  });

  const membershipTypes = [
    { id: 'basic', name: 'Basic Membership', price: 50, duration: '1 month' },
    { id: 'premium', name: 'Premium Membership', price: 120, duration: '3 months' },
    { id: 'annual', name: 'Annual Membership', price: 400, duration: '12 months' },
  ];

  const swimmingLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Professional'
  ];

  const timeSlots = [
    { id: 'morning', label: 'Morning (6:00 AM - 10:00 AM)', available: true },
    { id: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)', available: true },
    { id: 'evening', label: 'Evening (6:00 PM - 10:00 PM)', available: false },
  ];

  const onSubmit = async (data: SwimmingRegistrationFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Swimming registration data:', data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTimeSlots = watch('preferredTimeSlots') || [];

  const toggleTimeSlot = (slotId: string) => {
    const currentSlots = selectedTimeSlots;
    if (currentSlots.includes(slotId)) {
      setValue('preferredTimeSlots', currentSlots.filter(id => id !== slotId));
    } else {
      setValue('preferredTimeSlots', [...currentSlots, slotId]);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your swimming pool registration has been completed successfully. You will receive a confirmation email shortly with your membership details and access instructions.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
                    Register Another Member
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Waves className="w-10 h-10 mr-3 text-blue-600" />
              Swimming Pool Registration
            </h1>
            <p className="text-xl text-gray-600">
              Join our swimming community and enjoy world-class facilities
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Member Information</CardTitle>
            <CardDescription>
              Please provide your personal details and swimming preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Emergency Contact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Enter emergency contact name"
                      {...register('emergencyContact')}
                    />
                    {errors.emergencyContact && (
                      <p className="text-sm text-red-600">{errors.emergencyContact.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      placeholder="Enter emergency contact phone"
                      {...register('emergencyPhone')}
                    />
                    {errors.emergencyPhone && (
                      <p className="text-sm text-red-600">{errors.emergencyPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
                  <Textarea
                    id="medicalConditions"
                    placeholder="Please mention any medical conditions or allergies"
                    rows={3}
                    {...register('medicalConditions')}
                  />
                </div>
              </div>

              {/* Swimming Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Waves className="w-5 h-5 mr-2" />
                  Swimming Preferences
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="swimmingLevel">Swimming Level *</Label>
                  <select
                    id="swimmingLevel"
                    {...register('swimmingLevel')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your swimming level</option>
                    {swimmingLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  {errors.swimmingLevel && (
                    <p className="text-sm text-red-600">{errors.swimmingLevel.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Preferred Time Slots *</Label>
                  <div className="space-y-2">
                    {timeSlots.map(slot => (
                      <label key={slot.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedTimeSlots.includes(slot.id)}
                          onChange={() => toggleTimeSlot(slot.id)}
                          disabled={!slot.available}
                          className="rounded border-gray-300"
                        />
                        <span className={`${!slot.available ? 'text-gray-400' : ''}`}>
                          {slot.label}
                          {!slot.available && ' (Fully Booked)'}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.preferredTimeSlots && (
                    <p className="text-sm text-red-600">{errors.preferredTimeSlots.message}</p>
                  )}
                </div>
              </div>

              {/* Membership Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Membership Selection
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {membershipTypes.map(membership => (
                    <label key={membership.id} className="relative">
                      <input
                        type="radio"
                        value={membership.id}
                        {...register('membershipType')}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        watch('membershipType') === membership.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <h4 className="font-semibold text-gray-900">{membership.name}</h4>
                        <p className="text-2xl font-bold text-green-600">${membership.price}</p>
                        <p className="text-sm text-gray-600">{membership.duration}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.membershipType && (
                  <p className="text-sm text-red-600">{errors.membershipType.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms')}
                    className="mt-1 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/swimming/terms" className="text-blue-600 hover:text-blue-800">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/swimming/privacy" className="text-blue-600 hover:text-blue-800">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing Registration...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SwimmingRegistration;
