import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Camera, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Html5Qrcode } from 'html5-qrcode';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

interface UnifiedQRScannerProps {
  /** Callback when QR code is scanned */
  onScan?: (qrCode: string) => void;
  /** Whether to show as modal (true) or inline (false) */
  modal?: boolean;
  /** Whether scanning is in progress (for external control) */
  isScanning?: boolean;
  /** Whether to automatically send scanned QR to backend */
  autoSubmit?: boolean;
}

const UnifiedQRScanner: React.FC<UnifiedQRScannerProps> = ({
  onScan,
  modal = false,
  isScanning: externalScanning = false,
  autoSubmit = false,
}) => {
  const [scanning, setScanning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
  const scannerIdRef = useRef<string>(`qr-scanner-${Date.now()}`);

  // Generate unique ID for scanner element
  useEffect(() => {
    scannerIdRef.current = `qr-scanner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup: stop scanner when component unmounts
      stopCamera();
    };
  }, []);

  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
        }
        scannerRef.current = null;
      }
      setScanning(false);
      setError(null);
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  }, []);

  const scanQRCode = useCallback(async (code: string) => {
    setLoading(true);
    setResult(null);
    try {
      // Use unified QR scanner endpoint
      const response = await axiosInstance.post('/qr/scan', {
        qrCodeValue: code,
      });

      if (response.data.success) {
        const qrType = response.data.qrType || 'unknown';
        const typeLabel = qrType === 'gym' ? 'Gym' : qrType === 'swimming' ? 'Swimming' : '';

        setResult({
          success: true,
          message: response.data.message || `${typeLabel} check-in successful!`,
          attendance: response.data.attendance || response.data.data?.attendance,
          timeSlot: response.data.timeSlot,
          qrType: qrType as 'gym' | 'swimming',
        });
        toast.success(response.data.message || `${typeLabel} check-in successful!`);
        setQrCodeValue(''); // Clear input after successful scan

        if (onScan) {
          onScan(code);
        }
        if (modal) {
          setIsOpen(false);
        }
      } else {
        setResult({
          success: false,
          message: response.data.message || 'Check-in failed',
          qrType: response.data.qrType as 'gym' | 'swimming' | undefined,
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
        qrType: error.response?.data?.qrType as 'gym' | 'swimming' | undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [onScan, modal]);

  const handleQRCodeDetected = useCallback(
    async (decodedText: string) => {
      // Stop scanning once QR code is detected
      await stopCamera();

      if (autoSubmit) {
        // Automatically submit to backend
        await scanQRCode(decodedText);
      } else if (onScan) {
        // Call the onScan callback
        onScan(decodedText);
        if (modal) {
          setIsOpen(false);
        }
      }
    },
    [autoSubmit, onScan, modal, stopCamera, scanQRCode]
  );

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setResult(null);

      // Check if running on HTTPS or localhost (required for camera access)
      const isSecure =
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (!isSecure) {
        const errorMsg = 'Camera access requires HTTPS. Please use a secure connection.';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'Camera not supported on this device or browser.';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Set scanning state first so the element renders
      setScanning(true);

      // Wait for DOM to be ready and element to exist
      const scannerId = scannerIdRef.current;
      let scannerElement: HTMLElement | null = null;
      let retries = 0;
      const maxRetries = 10;

      // Retry mechanism to find the element
      while (!scannerElement && retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        scannerElement = document.getElementById(scannerId) || scannerElementRef.current;
        retries++;
      }

      if (!scannerElement) {
        setScanning(false);
        const errorMsg = 'Scanner element not found. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Stop any existing scanner
      if (scannerRef.current && scannerRef.current.isScanning) {
        await stopCamera();
        await new Promise((resolve) => setTimeout(resolve, 300));
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
          disableFlip: false, // Allow flipping for better detection
        },
        (decodedText) => {
          // QR code detected
          handleQRCodeDetected(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (just means no QR code detected yet)
          // Only log if it's not a common "not found" error
          if (!errorMessage.includes('No QR code found') && !errorMessage.includes('NotFoundException')) {
            // Silent - this is normal during scanning
          }
        }
      );
    } catch (error: any) {
      console.error('Error starting camera:', error);
      setScanning(false);
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
    }
  }, [stopCamera, handleQRCodeDetected]);

  const handleManualScan = async () => {
    if (!qrCodeValue.trim()) {
      toast.error('Please enter a QR code value');
      return;
    }

    await scanQRCode(qrCodeValue);
  };

  const handleOpen = () => {
    setError(null);
    setResult(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    stopCamera();
  };

  // Auto-start camera when modal opens
  useEffect(() => {
    if (modal && isOpen && !scanning) {
      // Wait for dialog to fully render before starting camera
      const timer = setTimeout(() => {
        startCamera();
      }, 500);
      return () => clearTimeout(timer);
    } else if (modal && !isOpen) {
      stopCamera();
    }
  }, [modal, isOpen, scanning, startCamera, stopCamera]);

  const scannerContent = (
    <div className="space-y-4">
      {/* Camera View */}
      <Card>
        <CardContent className="p-4">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{ maxHeight: '400px', minHeight: '300px', width: '100%' }}
          >
            {/* Scanner element - always rendered but hidden when not scanning */}
            <div
              id={scannerIdRef.current}
              ref={scannerElementRef}
              className="w-full"
              style={{ 
                minHeight: '300px', 
                width: '100%',
                display: scanning ? 'block' : 'none',
                backgroundColor: 'black'
              }}
            />
            {/* Placeholder when not scanning */}
            {!scanning && (
              <div className="relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '300px', width: '100%' }}>
                <p className="text-gray-500">Click "Open Camera Scanner" to start scanning</p>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {scanning && (
            <>
              <div className="mt-4 flex gap-2">
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  Stop Camera
                </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Point your camera at the QR code to scan automatically
              </p>
            </>
          )}
        </CardContent>
      </Card>

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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
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
              className={`flex items-start gap-3 ${result.success ? 'text-green-600' : 'text-red-600'}`}
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

  // Modal mode
  if (modal) {
    return (
      <>
        <Card className="relative overflow-hidden transition-all hover:shadow-lg border border-[#E2F5FB] group cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#023E8A] text-lg">Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground">Mark your attendance</p>
                </div>
              </div>
              <Button
                onClick={handleOpen}
                className="bg-[#0077B6] hover:bg-[#005885] text-white"
                disabled={externalScanning || scanning}
              >
                <Camera className="w-4 h-4 mr-2" />
                {externalScanning || scanning ? 'Scanning...' : 'Open Scanner'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {error && !scanning ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                  <Button onClick={handleManualScan} className="mt-2 w-full" variant="outline">
                    Enter QR Code Manually
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative rounded-lg overflow-hidden" style={{ minHeight: '300px', width: '100%' }}>
                    {/* Scanner element - always rendered but hidden when not scanning */}
                    <div
                      id={scannerIdRef.current}
                      ref={scannerElementRef}
                      className="w-full"
                      style={{ 
                        minHeight: '300px', 
                        width: '100%',
                        display: scanning ? 'block' : 'none',
                        backgroundColor: 'black'
                      }}
                    />
                    {/* Placeholder when not scanning */}
                    {!scanning && (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-500">Camera will start when you click the button below</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {scanning
                      ? 'Point your camera at the QR code to scan automatically'
                      : 'Click the button below to start camera'}
                  </p>
                  <div className="flex space-x-2">
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
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                      </Button>
                    )}
                    {scanning && (
                      <Button onClick={stopCamera} variant="outline" className="flex-1">
                        <X className="w-4 h-4 mr-2" />
                        Stop Camera
                      </Button>
                    )}
                    <Button onClick={handleClose} variant="outline" className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Or Enter QR Code Manually</label>
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
                        placeholder="Enter QR code value"
                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                      />
                      <Button onClick={handleManualScan} disabled={loading || !qrCodeValue.trim()}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Inline mode
  return scannerContent;
};

export default UnifiedQRScanner;

