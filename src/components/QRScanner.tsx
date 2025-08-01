import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  QrCodeIcon,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useNavigate } from "react-router-dom";
import * as QRCodeAPI from "../lib/qrCodeAPI";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  onScanComplete?: (qrData: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const QRScanner = ({
  onScanComplete = () => {},
  onClose,
  isOpen = true,
}: QRScannerProps) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    data: string;
    isRegistered: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const extractQRId = (qrData: string): string | null => {
    // Handle different QR code formats
    if (qrData.includes("/qr/")) {
      // Extract ID from URL like "https://domain.com/qr/B4K8P2"
      const match = qrData.match(/\/qr\/([A-Z0-9]+)/);
      return match ? match[1] : null;
    } else if (/^[A-Z0-9]{6}$/.test(qrData)) {
      // Direct ID format like "B4K8P2"
      return qrData;
    }
    return null;
  };

  const startCamera = async () => {
    setCameraLoading(true);
    setError(null);

    try {
      if (videoRef.current) {
        // Initialize QR Scanner
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          async (result) => {
            if (scanning) return; // Prevent multiple scans

            setScanning(true);
            const qrId = extractQRId(result.data);

            if (qrId) {
              // Check if it's registered in our database
              try {
                const qrRecord = await QRCodeAPI.getQRCodeById(qrId);

                if (qrRecord) {
                  // QR code exists, check if it's assigned
                  const isAssigned = qrRecord.status === "assigned";
                  setScanResult({ data: qrId, isRegistered: isAssigned });
                } else {
                  // QR code doesn't exist in database
                  setScanResult({ data: qrId, isRegistered: false });
                }

                onScanComplete(qrId);

                // Stop scanning after successful scan
                if (qrScannerRef.current) {
                  qrScannerRef.current.stop();
                }

                // Reset scanning state after processing
                setScanning(false);
              } catch (err) {
                console.error("Error checking QR code:", err);
                setScanResult({ data: qrId, isRegistered: false });
                onScanComplete(qrId);
                setScanning(false);
              }
            } else {
              setError(
                "This QR code is not from our system. Please scan a valid asset QR code.",
              );
              setScanning(false);
            }
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
          },
        );

        await qrScannerRef.current.start();
        setCameraActive(true);
        setCameraLoading(false);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraLoading(false);

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Camera access denied. Please allow camera permissions and refresh the page.",
          );
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotSupportedError") {
          setError("Camera not supported on this device.");
        } else {
          setError("Failed to access camera. Please try again.");
        }
      } else {
        setError("Failed to access camera. Please try again.");
      }
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  };

  const handleProceed = async () => {
    if (scanResult) {
      if (scanResult.isRegistered) {
        // We already know it's registered, get the data and navigate
        try {
          const qrData = await QRCodeAPI.getQRCodeById(scanResult.data);

          if (
            qrData &&
            qrData.status === "assigned" &&
            qrData.assigned_asset_id
          ) {
            navigate(`/asset/${qrData.assigned_asset_id}`);
          } else {
            navigate(`/qr/${qrData.id}`);
          }
        } catch (err) {
          console.error("Error getting QR code details:", err);
          setError("Failed to load asset details. Please try again.");
        }
      } else {
        // Not registered, navigate to assignment page
        navigate(`/qr/${scanResult.data}`);
      }
    }
  };

  const startScanning = async () => {
    if (!cameraActive || !qrScannerRef.current) {
      setError("Camera is not active. Please allow camera access.");
      return;
    }

    setScanning(false); // Reset scanning state
    setError(null);
    setScanResult(null);

    // Resume scanning
    try {
      await qrScannerRef.current.start();
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError("Failed to start scanning. Please try again.");
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setScanning(false);

    // Restart the scanner
    if (qrScannerRef.current && cameraActive) {
      qrScannerRef.current.start().catch((err) => {
        console.error("Error restarting scanner:", err);
      });
    }
  };

  const handleClose = () => {
    stopCamera();
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <QrCodeIcon className="h-6 w-6" />
            QR Code Scanner
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />

            {/* Loading overlay */}
            {cameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}

            {/* No camera overlay */}
            {!cameraActive && !cameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Camera not available</p>
                </div>
              </div>
            )}

            {/* Scanning overlay */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-20">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Processing QR code...</p>
                </div>
              </div>
            )}

            {/* Scan guide overlay */}
            {cameraActive && !scanning && !scanResult && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-70"></div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-sm bg-black bg-opacity-70 rounded px-2 py-1">
                    Position QR code within the frame
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                {error.includes("denied") && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Scan Result Message */}
          {scanResult && (
            <Alert
              variant={scanResult.isRegistered ? "default" : "destructive"}
            >
              {scanResult.isRegistered ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {scanResult.isRegistered
                  ? "Asset Found"
                  : "Unassigned Asset Detected"}
              </AlertTitle>
              <AlertDescription>
                QR Code: <strong>{scanResult.data}</strong>
                <br />
                {scanResult.isRegistered
                  ? "This QR code is assigned to an asset in the system."
                  : "This QR code exists but is not assigned to any asset yet."}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex w-full justify-between space-x-2">
            {scanResult ? (
              <>
                <Button
                  variant="outline"
                  onClick={resetScanner}
                  className="flex-1"
                >
                  Scan Again
                </Button>
                <Button className="flex-1" onClick={handleProceed}>
                  {scanResult.isRegistered ? "View Asset" : "Register Asset"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startScanning}
                  disabled={scanning || !cameraActive || cameraLoading}
                  className="flex-1"
                >
                  {scanning
                    ? "Scanning..."
                    : cameraLoading
                      ? "Loading..."
                      : "Start Scan"}
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Scanning Instructions</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <ul className="text-xs space-y-2 text-slate-600">
                <li>• Position the QR code within the scanning frame</li>
                <li>• Hold your device steady for best results</li>
                <li>• Ensure adequate lighting for clear scanning</li>
                <li>• Allow camera permissions when prompted</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;
