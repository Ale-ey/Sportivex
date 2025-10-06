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
  AlertTriangle, 
  Calendar, 
  User, 
 
 
  CheckCircle,
 
  XCircle,
  Info
} from 'lucide-react';

const cancellationSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  reason: z.string().min(10, 'Please provide a reason for cancellation'),
  cancellationDate: z.string().min(1, 'Cancellation date is required'),
  refundRequest: z.boolean(),
  finalPaymentDate: z.string().optional(),
  additionalComments: z.string().optional(),
});

type CancellationFormData = z.infer<typeof cancellationSchema>;

const Cancellation: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [showMemberInfo, setShowMemberInfo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    
  } = useForm<CancellationFormData>({
    resolver: zodResolver(cancellationSchema),
  });

  const refundRequest = watch('refundRequest');

  const onSubmit = async (data: CancellationFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Cancellation data:', data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Cancellation error:', error);
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
        amountPaid: 120,
        refundEligible: true
      });
      setShowMemberInfo(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancellation Request Submitted</h2>
                <p className="text-gray-600 mb-6">
                  Your membership cancellation request has been submitted successfully. 
                  You will receive a confirmation email within 24 hours with details about 
                  your cancellation and any applicable refunds.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => window.location.href = '/dashboard'} className="w-full">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
                    Submit Another Cancellation
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 mr-3 text-red-600" />
              Membership Cancellation
            </h1>
            <p className="text-xl text-gray-600">
              Cancel your swimming pool membership (Available after 3 months)
            </p>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start">
              <Info className="w-6 h-6 text-red-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Important Cancellation Policy</h3>
                <ul className="text-red-800 space-y-1">
                  <li>• Membership can only be cancelled after 3 months of active membership</li>
                  <li>• Cancellation requests must be submitted at least 30 days before the next billing cycle</li>
                  <li>• Refunds are calculated based on unused membership time</li>
                  <li>• Access to facilities will continue until the end of the current billing period</li>
                  <li>• A processing fee may apply to refunds</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cancellation Request</CardTitle>
            <CardDescription>
              Please provide the required information to process your membership cancellation
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
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Member Information</h4>
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
                      {memberInfo.refundEligible && (
                        <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
                          <p className="text-green-800 text-sm">
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            This member is eligible for refunds
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Cancellation Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Cancellation Details
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Cancellation *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a detailed reason for cancelling your membership"
                    rows={4}
                    {...register('reason')}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600">{errors.reason.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationDate">Preferred Cancellation Date *</Label>
                  <Input
                    id="cancellationDate"
                    type="date"
                    {...register('cancellationDate')}
                  />
                  {errors.cancellationDate && (
                    <p className="text-sm text-red-600">{errors.cancellationDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finalPaymentDate">Final Payment Date (if applicable)</Label>
                  <Input
                    id="finalPaymentDate"
                    type="date"
                    {...register('finalPaymentDate')}
                  />
                </div>
              </div>

              {/* Refund Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Refund Information</h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="refundRequest"
                    {...register('refundRequest')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="refundRequest">
                    Request refund for unused membership time
                  </Label>
                </div>

                {refundRequest && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Refund Information</h4>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>• Refunds are calculated based on unused membership time</li>
                      <li>• Processing time: 5-10 business days</li>
                      <li>• A processing fee of $10 may apply</li>
                      <li>• Refunds will be issued to the original payment method</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Additional Comments */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="additionalComments">Additional Comments (Optional)</Label>
                  <Textarea
                    id="additionalComments"
                    placeholder="Any additional information or special requests"
                    rows={3}
                    {...register('additionalComments')}
                  />
                </div>
              </div>

              {/* Confirmation */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Cancellation Confirmation</h4>
                <p className="text-gray-700 text-sm mb-3">
                  By submitting this form, you acknowledge that:
                </p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• You understand the cancellation policy</li>
                  <li>• Your membership will be cancelled as requested</li>
                  <li>• You will receive a confirmation email</li>
                  <li>• Any applicable refunds will be processed according to our policy</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                  {isLoading ? 'Processing Cancellation...' : 'Submit Cancellation Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cancellation;
