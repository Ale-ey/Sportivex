import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Camera, CheckCircle2, AlertCircle, Loader2, Dumbbell, Waves } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';

const QRCodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    attendance?: any;
    timeSlot?: any;
    qrType?: 'gym' | 'swimming';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);
  const [qrCodeValue, setQrCodeValue] = useState('');

  useEffect(() => {
    return () => {
      // Cleanup: stop scanner when component unmounts
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setResult(null);

      // Check if running on HTTPS or localhost (required for camera access)
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isSecure) {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        toast.error('Camera access requires HTTPS connection');
        return;
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device or browser.');
        toast.error('Camera not supported');
        return;
      }

      const scannerId = 'qr-scanner-main';
      if (!scannerElementRef.current) {
        setError('Scanner element not found');
        return;
      }

      // Create Html5Qrcode instance
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      // Start scanning with back camera preference for mobile
      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // Scanning area
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // QR code detected
          handleQRCodeDetected(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (just means no QR code detected yet)
          // Only log if it's not a common "not found" error
          if (!errorMessage.includes('No QR code found')) {
            // Silent - this is normal during scanning
          }
        }
      );

      setScanning(true);
    } catch (error: any) {
      console.error('Error starting camera:', error);
      let errorMessage = 'Failed to access camera. ';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += error.message || 'Please check permissions.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
      scannerRef.current = null;
      setScanning(false);
      setError(null);
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  };

  const handleQRCodeDetected = async (decodedText: string) => {
    // Stop scanning once QR code is detected
    await stopCamera();
    
    // Scan the QR code
    await scanQRCode(decodedText);
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
      // Use unified QR scanner endpoint
      const response = await axiosInstance.post('/qr/scan', {
        qrCodeValue: code
      });

      if (response.data.success) {
        const qrType = response.data.qrType || 'unknown';
        const typeLabel = qrType === 'gym' ? 'Gym' : qrType === 'swimming' ? 'Swimming' : '';
        
        setResult({
          success: true,
          message: response.data.message || `${typeLabel} check-in successful!`,
          attendance: response.data.attendance || response.data.data?.attendance,
          timeSlot: response.data.timeSlot,
          qrType: qrType as 'gym' | 'swimming'
        });
        toast.success(response.data.message || `${typeLabel} check-in successful!`);
        setQrCodeValue(''); // Clear input after successful scan
      } else {
        setResult({
          success: false,
          message: response.data.message || 'Check-in failed',
          qrType: response.data.qrType as 'gym' | 'swimming' | undefined
        });
        
        // Don't show toast for registration errors (402) - handled in UI
        if (response.status !== 402) {
          toast.error(response.data.message || 'Check-in failed');
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to scan QR code';
      
      // Don't show toast for registration errors (402) - handled in UI
      if (error.response?.status !== 402) {
        toast.error(errorMessage);
      }
      
      setResult({
        success: false,
        message: errorMessage,
        qrType: error.response?.data?.qrType as 'gym' | 'swimming' | undefined
      });
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
            <div className="relative rounded-lg overflow-hidden bg-black" style={{ maxHeight: '400px', minHeight: '300px' }}>
              <div
                id="qr-scanner-main"
                ref={scannerElementRef}
                className="w-full"
                style={{ minHeight: '300px' }}
              />
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Stop Camera
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground mt-2">
              Point your camera at the QR code to scan automatically
            </p>
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
              <Button 
                onClick={async () => {
                  try {
                    await startCamera();
                  } catch (error) {
                    console.error('Error starting camera:', error);
                  }
                }} 
                variant="outline" 
                className="w-full"
              >
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
                <div className="flex items-center gap-2 mb-1">
                  {result.qrType === 'gym' && <Dumbbell className="w-4 h-4" />}
                  {result.qrType === 'swimming' && <Waves className="w-4 h-4" />}
                  <p className="font-semibold">{result.message}</p>
                </div>
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
                {!result.success && result.qrType && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>QR Type: {result.qrType === 'gym' ? 'Gym' : 'Swimming'}</p>
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








