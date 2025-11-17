import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Camera, X, Scan } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  isScanning?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, isScanning = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && hasPermission) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, hasPermission]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setHasPermission(false);
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
  };

  const handleOpen = async () => {
    setError(null);
    setScannedCode(null);
    
    // Check for camera permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop immediately after checking
      setHasPermission(true);
      setIsOpen(true);
    } catch (err: any) {
      setHasPermission(false);
      setError('Camera permission denied. Please enable camera access in your browser settings.');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    stopCamera();
  };

  const handleManualInput = () => {
    const qrCode = prompt('Enter QR code manually:');
    if (qrCode && qrCode.trim()) {
      onScan(qrCode.trim());
      handleClose();
    }
  };

  // Simple QR code detection (for demo - in production, use a library like html5-qrcode)
  const handleVideoClick = () => {
    // For now, we'll use manual input as a fallback
    // In production, integrate a QR code scanning library
    handleManualInput();
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
                <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    onClick={handleVideoClick}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white rounded-lg w-64 h-64 opacity-50" />
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Point your camera at the QR code or click to enter manually
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

