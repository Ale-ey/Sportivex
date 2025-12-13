import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Camera, X, Scan } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  isScanning?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, isScanning = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);

  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning()) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
      scannerRef.current = null;
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    stopCamera();
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Check if running on HTTPS or localhost (required for camera access)
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
      if (!isSecure) {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        return;
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device or browser.');
        return;
      }

      const scannerId = 'qr-scanner-dialog';
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
          onScan(decodedText);
          handleClose();
        },
        (errorMessage) => {
          // Ignore scanning errors (just means no QR code detected yet)
          // Only log if it's not a common "not found" error
          if (!errorMessage.includes('No QR code found')) {
            // Silent - this is normal during scanning
          }
        }
      );
    } catch (err: any) {
      console.error('Error starting camera:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += err.message || 'Please check permissions.';
      }
      
      setError(errorMessage);
    }
  }, [onScan, handleClose]);

  useEffect(() => {
    if (isOpen && scannerElementRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else if (!isOpen) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const handleOpen = async () => {
    setError(null);
    setIsOpen(true);
  };

  const handleManualInput = () => {
    const qrCode = prompt('Enter QR code manually:');
    if (qrCode && qrCode.trim()) {
      onScan(qrCode.trim());
      handleClose();
    }
  };

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
                <h3 className="font-semibold text-[#023E8A] text-lg">
                  Scan QR Code
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mark your attendance
                </p>
              </div>
            </div>
            <Button
              onClick={handleOpen}
              className="bg-[#0077B6] hover:bg-[#005885] text-white"
              disabled={isScanning}
            >
              <Scan className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Open Scanner'}
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
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  onClick={handleManualInput}
                  className="mt-2 w-full"
                  variant="outline"
                >
                  Enter QR Code Manually
                </Button>
              </div>
            ) : (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
                  <div
                    id="qr-scanner-dialog"
                    ref={scannerElementRef}
                    className="w-full"
                    style={{ minHeight: '300px' }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Point your camera at the QR code to scan automatically
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleManualInput}
                    variant="outline"
                    className="flex-1"
                  >
                    Enter Manually
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScanner;

