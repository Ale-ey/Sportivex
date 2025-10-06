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
  Snowflake, 
  Calendar, 
  User, 
  Clock,

  AlertCircle,
  Info,
  Shield
} from 'lucide-react';

const freezeApplicationSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  freezeStartDate: z.string().min(1, 'Freeze start date is required'),
  freezeEndDate: z.string().min(1, 'Freeze end date is required'),
  reason: z.string().min(10, 'Please provide a reason for freezing membership'),
  emergencyContact: z.string().min(2, 'Emergency contact is required'),
  emergencyPhone: z.string().min(10, 'Emergency phone is required'),
  returnDate: z.string().min(1, 'Expected return date is required'),
  additionalInfo: z.string().optional(),
}).refine((data) => new Date(data.freezeEndDate) > new Date(data.freezeStartDate), {
  message: "Freeze end date must be after start date",
  path: ["freezeEndDate"],
});

type FreezeApplicationFormData = z.infer<typeof freezeApplicationSchema>;

const FreezeApplication: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [showMemberInfo, setShowMemberInfo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FreezeApplicationFormData>({
    resolver: zodResolver(freezeApplicationSchema),
  });

  const freezeStartDate = watch('freezeStartDate');
  const freezeEndDate = watch('freezeEndDate');

  const onSubmit = async (data: FreezeApplicationFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Freeze application data:', data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Freeze application error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberLookup = async (memberId: string) => {
    // Simulate member lookup
    if (memberId) {
      setMemberInfo({
        id: memberId,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        membershipType: 'Premium',
        startDate: '2024-01-15',
        endDate: '2024-07-15',
        status: 'Active',
        remainingDays: 45,
        freezeEligible: true,
        maxFreezeDays: 90,
        usedFreezeDays: 0
      });
      setShowMemberInfo(true);
    }
  };

  const calculateFreezeDuration = () => {
    if (freezeStartDate && freezeEndDate) {
      const start = new Date(freezeStartDate);
      const end = new Date(freezeEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Snowflake className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Freeze Application Submitted</h2>
                <p className="text-gray-600 mb-6">
                  Your membership freeze application has been submitted successfully. 
                  You will receive a confirmation email within 24 hours with details about 
                  your freeze period and reactivation instructions.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
                    Submit Another Application
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
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Snowflake className="w-10 h-10 mr-3 text-blue-600" />
              Membership Freeze Application
            </h1>
            <p className="text-xl text-gray-600">
              Temporarily freeze your swimming pool membership
            </p>
          </div>
        </div>

        {/* Freeze Policy Information */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start">
              <Info className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Membership Freeze Policy</h3>
                <ul className="text-blue-800 space-y-1">
                  <li>• Members can freeze their membership for a minimum of 7 days and maximum of 90 days per year</li>
                  <li>• Freeze applications must be submitted at least 7 days in advance</li>
                  <li>• Membership fees are suspended during the freeze period</li>
                  <li>• Access to facilities is restricted during freeze period</li>
                  <li>• Membership automatically reactivates at the end of freeze period</li>
                  <li>• Emergency contact information is required for freeze applications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Freeze Application</CardTitle>
            <CardDescription>
              Please provide the required information to freeze your membership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Member Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Member Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="memberId">Member ID *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="memberId"
                      placeholder="Enter your member ID"
                      {...register('memberId')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleMemberLookup(watch('memberId'))}
                    >
                      Lookup
                    </Button>
                  </div>
                  {errors.memberId && (
                    <p className="text-sm text-red-600">{errors.memberId.message}</p>
                  )}
                </div>

                {/* Member Info Display */}
                {showMemberInfo && memberInfo && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-green-900 mb-3">Member Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Name:</strong> {memberInfo.name}</p>
                          <p><strong>Email:</strong> {memberInfo.email}</p>
                          <p><strong>Phone:</strong> {memberInfo.phone}</p>
                        </div>
                        <div>
                          <p><strong>Membership:</strong> {memberInfo.membershipType}</p>
                          <p><strong>Status:</strong> {memberInfo.status}</p>
                          <p><strong>Remaining Days:</strong> {memberInfo.remainingDays}</p>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-blue-100 border border-blue-200 rounded">
                        <p className="text-blue-800 text-sm">
                          <Shield className="w-4 h-4 inline mr-1" />
                          Freeze eligible: {memberInfo.maxFreezeDays - memberInfo.usedFreezeDays} days remaining
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Freeze Period */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Freeze Period
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freezeStartDate">Freeze Start Date *</Label>
                    <Input
                      id="freezeStartDate"
                      type="date"
                      {...register('freezeStartDate')}
                    />
                    {errors.freezeStartDate && (
                      <p className="text-sm text-red-600">{errors.freezeStartDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freezeEndDate">Freeze End Date *</Label>
                    <Input
                      id="freezeEndDate"
                      type="date"
                      {...register('freezeEndDate')}
                    />
                    {errors.freezeEndDate && (
                      <p className="text-sm text-red-600">{errors.freezeEndDate.message}</p>
                    )}
                  </div>
                </div>

                {freezeStartDate && freezeEndDate && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Freeze Duration</h4>
                    <p className="text-gray-700">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Duration: {calculateFreezeDuration()} days
                    </p>
                    {calculateFreezeDuration() < 7 && (
                      <p className="text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Minimum freeze period is 7 days
                      </p>
                    )}
                    {calculateFreezeDuration() > 90 && (
                      <p className="text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Maximum freeze period is 90 days
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Reason for Freeze */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Reason for Freeze</h3>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Freezing Membership *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a detailed reason for freezing your membership"
                    rows={4}
                    {...register('reason')}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600">{errors.reason.message}</p>
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
              </div>

              {/* Return Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Return Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="returnDate">Expected Return Date *</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    {...register('returnDate')}
                  />
                  {errors.returnDate && (
                    <p className="text-sm text-red-600">{errors.returnDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any additional information or special requests"
                    rows={3}
                    {...register('additionalInfo')}
                  />
                </div>
              </div>

              {/* Confirmation */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Freeze Application Confirmation</h4>
                <p className="text-gray-700 text-sm mb-3">
                  By submitting this form, you acknowledge that:
                </p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• You understand the freeze policy and terms</li>
                  <li>• Your membership will be frozen for the specified period</li>
                  <li>• You will not have access to facilities during the freeze period</li>
                  <li>• Your membership will automatically reactivate at the end of the freeze period</li>
                  <li>• You will receive a confirmation email with freeze details</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? 'Processing Application...' : 'Submit Freeze Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreezeApplication;
