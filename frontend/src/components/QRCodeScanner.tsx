import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { swimmingService } from '@/services/swimmingService';
import toast from 'react-hot-toast';

const QRCodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    attendance?: any;
    timeSlot?: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [qrCodeValue, setQrCodeValue] = useState('');

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
        setResult(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleManualScan = async () => {
    if (!qrCodeValue.trim()) {
      toast.error('Please enter a QR code value');
      return;
    }

    await scanQRCode(qrCodeValue);
  };

  const scanQRCode = async (code: string) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await swimmingService.scanQRCode(code);
      if (response.success) {
        setResult({
          success: true,
          message: response.message || 'Check-in successful!',
          attendance: response.attendance,
          timeSlot: response.timeSlot,
        });
        toast.success(response.message || 'Check-in successful!');
        setQrCodeValue(''); // Clear input after successful scan
      } else {
        setResult({
          success: false,
          message: response.message || 'Check-in failed',
        });
        toast.error(response.message || 'Check-in failed');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to scan QR code';
      setResult({
        success: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera View */}
      {scanning && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-[#0077B6] rounded-lg w-64 h-64" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Stop Camera
              </Button>
              <Button
                onClick={() => {
                  // In a real implementation, you would use a QR code scanning library
                  // like html5-qrcode or jsQR here
                  toast.info('QR scanning from camera requires a QR code library. Use manual entry for now.');
                }}
                className="flex-1"
              >
                Scan QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual QR Code Entry */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Enter QR Code Value</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrCodeValue}
                  onChange={(e) => setQrCodeValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualScan();
                    }
                  }}
                  placeholder="Scan or enter QR code value"
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                />
                <Button onClick={handleManualScan} disabled={loading || !qrCodeValue.trim()}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {!scanning && (
              <Button onClick={startCamera} variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Open Camera Scanner
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Result */}
      {result && (
        <Card>
          <CardContent className="p-4">
            <div
              className={`flex items-start gap-3 ${
                result.success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{result.message}</p>
                {result.success && result.timeSlot && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>
                      Time Slot: {result.timeSlot.startTime} - {result.timeSlot.endTime}
                    </p>
                    <p>
                      Capacity: {result.timeSlot.currentCount} / {result.timeSlot.maxCapacity}
                    </p>
                    {result.attendance && (
                      <p>Checked in at: {new Date(result.attendance.checkInTime).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeScanner;




