import React, { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  FileText,
  Image,
  Wrench,
  History,
  Edit,
  Trash2,
  ArrowLeft,
  Plus,
  X,
  Camera,
  Check,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MaintenanceTaskList from "./MaintenanceTaskList";
import ServiceLogForm from "./ServiceLogForm";

interface AssetPhoto {
  id: string;
  url: string;
  description?: string;
  uploadedAt: string;
}

interface AssetDetailProps {
  asset?: {
    id: string;
    name: string;
    type: string;
    model: string;
    serialNumber: string;
    installDate: string;
    location: string;
    status: "operational" | "maintenance" | "offline";
    lastServiced?: string;
    nextServiceDue?: string;
    image?: string;
    photos?: AssetPhoto[];
  };
}

const AssetDetail = ({ asset: propAsset }: AssetDetailProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("info");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [photos, setPhotos] = useState<AssetPhoto[]>([]);
  const [showAddPhotoDialog, setShowAddPhotoDialog] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoDescription, setNewPhotoDescription] = useState("");
  const [photoUploadMessage, setPhotoUploadMessage] = useState("");
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<AssetPhoto[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use prop asset or create mock data based on URL param
  const asset = propAsset || {
    id: id || "asset-123",
    name: `Asset ${id || "123"}`,
    type: "HVAC System",
    model: "Carrier Infinity 24VNA9",
    serialNumber: `CAR-2023-${Math.floor(Math.random() * 10000)}`,
    installDate: "2023-05-15",
    location: "Building A - Roof",
    status: "operational" as const,
    lastServiced: "2023-11-10",
    nextServiceDue: "2024-05-10",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80",
    photos: [
      {
        id: "photo-1",
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80",
        description: "Installation view",
        uploadedAt: "2023-11-15T10:30:00Z",
      },
      {
        id: "photo-2",
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
        description: "Control panel",
        uploadedAt: "2023-11-10T14:20:00Z",
      },
    ],
  };

  // Initialize photos from asset data
  React.useEffect(() => {
    if (asset.photos) {
      setPhotos(asset.photos);
    }
  }, [asset.photos]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) {
      setPhotoUploadMessage("Please enter a photo URL");
      return;
    }

    const newPhoto: AssetPhoto = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl,
      description: newPhotoDescription,
      uploadedAt: new Date().toISOString(),
    };

    setPhotos([...photos, newPhoto]);
    setNewPhotoUrl("");
    setNewPhotoDescription("");
    setShowAddPhotoDialog(false);
    setPhotoUploadMessage("Photo added successfully!");

    // Clear success message after 3 seconds
    setTimeout(() => setPhotoUploadMessage(""), 3000);
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(photos.filter((photo) => photo.id !== photoId));
    setPhotoUploadMessage("Photo removed successfully!");
    setTimeout(() => setPhotoUploadMessage(""), 3000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      setShowCameraDialog(true);

      // Wait for dialog to open and video element to be available
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (error) {
      console.error("Camera access error:", error);
      setPhotoUploadMessage(
        "Unable to access camera. Please check permissions and ensure you're using HTTPS.",
      );
      setTimeout(() => setPhotoUploadMessage(""), 5000);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCameraDialog(false);
  };

  const capturePhoto = () => {
    if (
      videoRef.current &&
      canvasRef.current &&
      videoRef.current.videoWidth > 0
    ) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context && canvas.width > 0 && canvas.height > 0) {
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        const newPhoto: AssetPhoto = {
          id: `captured-${Date.now()}`,
          url: dataUrl,
          description: `Asset photo ${capturedPhotos.length + 1}`,
          uploadedAt: new Date().toISOString(),
        };

        const updatedPhotos = [...capturedPhotos, newPhoto];
        setCapturedPhotos(updatedPhotos);

        // Set first photo as main image if none selected
        if (!mainImageId && updatedPhotos.length === 1) {
          setMainImageId(newPhoto.id);
        }

        setPhotoUploadMessage(
          `Photo ${updatedPhotos.length} captured successfully!`,
        );
        setTimeout(() => setPhotoUploadMessage(""), 3000);

        // Stop camera after 5 photos
        if (updatedPhotos.length >= 5) {
          stopCamera();
          setPhotoUploadMessage(
            "Maximum 5 photos captured. You can now select your main image.",
          );
          setTimeout(() => setPhotoUploadMessage(""), 5000);
        }
      } else {
        setPhotoUploadMessage(
          "Camera not ready. Please wait a moment and try again.",
        );
        setTimeout(() => setPhotoUploadMessage(""), 3000);
      }
    } else {
      setPhotoUploadMessage("Camera not ready. Please wait for video to load.");
      setTimeout(() => setPhotoUploadMessage(""), 3000);
    }
  };

  const selectMainImage = (photoId: string) => {
    setMainImageId(photoId);
    setPhotoUploadMessage("Main image updated successfully!");
    setTimeout(() => setPhotoUploadMessage(""), 3000);
  };

  const getMainImage = () => {
    if (mainImageId) {
      const mainPhoto = capturedPhotos.find(
        (photo) => photo.id === mainImageId,
      );
      if (mainPhoto) return mainPhoto.url;
    }
    return asset.image;
  };

  const getThumbnailPhotos = () => {
    return capturedPhotos.filter((photo) => photo.id !== mainImageId);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className={getStatusColor(asset.status)}>
                {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground ml-2">
                ID: {asset.id}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <Button variant="outline" className="mr-2">
              <Edit className="h-4 w-4 mr-2" /> Edit Asset
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="info">Asset Information</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Tasks</TabsTrigger>
            <TabsTrigger value="service">Service History</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Details</CardTitle>
                  <CardDescription>
                    Basic information about this asset
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Type
                      </p>
                      <p>{asset.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Model
                      </p>
                      <p>{asset.model}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Serial Number
                      </p>
                      <p>{asset.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Location
                      </p>
                      <p>{asset.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Install Date
                      </p>
                      <p>{asset.installDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                  <CardDescription>
                    Maintenance schedule and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Serviced
                    </p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{asset.lastServiced || "Not available"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Next Service Due
                    </p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{asset.nextServiceDue || "Not scheduled"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" /> View Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Asset Image</CardTitle>
                  <Button
                    onClick={startCamera}
                    disabled={capturedPhotos.length >= 5}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {capturedPhotos.length === 0
                      ? "Take Photos"
                      : `Photos (${capturedPhotos.length}/5)`}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative h-64 w-full overflow-hidden rounded-md border">
                    <img
                      src={getMainImage()}
                      alt={asset.name}
                      className="object-cover w-full h-full"
                    />
                    {mainImageId && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" /> Main Image
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Photos */}
                  {getThumbnailPhotos().length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Other Photos (click to set as main)
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {getThumbnailPhotos().map((photo) => (
                          <div
                            key={photo.id}
                            className="relative aspect-square overflow-hidden rounded border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                            onClick={() => selectMainImage(photo.id)}
                          >
                            <img
                              src={photo.url}
                              alt={photo.description || "Asset photo"}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}

                        {/* Show main image as thumbnail if it's from captured photos */}
                        {mainImageId &&
                          capturedPhotos.find((p) => p.id === mainImageId) && (
                            <div
                              className="relative aspect-square overflow-hidden rounded border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                              onClick={() => setMainImageId(null)}
                            >
                              <img
                                src={asset.image}
                                alt="Original asset image"
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  Original
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Asset Photos</CardTitle>
                    <CardDescription>
                      Visual documentation and reference images
                    </CardDescription>
                  </div>
                  <Dialog
                    open={showAddPhotoDialog}
                    onOpenChange={setShowAddPhotoDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Camera className="h-4 w-4 mr-2" /> Add Photo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Photo</DialogTitle>
                        <DialogDescription>
                          Add a photo to document this asset. You can provide a
                          URL and optional description.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label
                            htmlFor="photo-url"
                            className="text-sm font-medium"
                          >
                            Photo URL
                          </label>
                          <Input
                            id="photo-url"
                            placeholder="https://example.com/photo.jpg"
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label
                            htmlFor="photo-description"
                            className="text-sm font-medium"
                          >
                            Description (optional)
                          </label>
                          <Textarea
                            id="photo-description"
                            placeholder="Brief description of the photo..."
                            value={newPhotoDescription}
                            onChange={(e) =>
                              setNewPhotoDescription(e.target.value)
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddPhotoDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddPhoto}>
                          <Plus className="h-4 w-4 mr-2" /> Add Photo
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {photoUploadMessage && (
                  <Alert className="mb-4">
                    <AlertDescription>{photoUploadMessage}</AlertDescription>
                  </Alert>
                )}

                {photos.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No photos uploaded yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add photos to document this asset
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border">
                          <img
                            src={photo.url}
                            alt={photo.description || "Asset photo"}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80";
                            }}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(photo.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {photo.description && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">
                              {photo.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(photo.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Maintenance Tasks</CardTitle>
                    <CardDescription>
                      Scheduled and completed maintenance tasks
                    </CardDescription>
                  </div>
                  <Button>
                    <Wrench className="h-4 w-4 mr-2" /> Add New Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MaintenanceTaskList assetId={asset.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service">
            {showServiceForm ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>New Service Log</CardTitle>
                    <Button
                      variant="ghost"
                      onClick={() => setShowServiceForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ServiceLogForm
                    assetId={asset.id}
                    onSubmit={() => setShowServiceForm(false)}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Service History</CardTitle>
                      <CardDescription>
                        Record of all service and maintenance activities
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowServiceForm(true)}>
                      <History className="h-4 w-4 mr-2" /> Add Service Log
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample service logs - would be populated from database */}
                    {[1, 2, 3].map((log) => (
                      <div key={log} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              Quarterly Maintenance
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span className="mr-3">2023-{log * 3}-15</span>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>10:30 AM</span>
                            </div>
                          </div>
                          <Badge>Completed</Badge>
                        </div>
                        <p className="text-sm mt-2">
                          Performed routine inspection and filter replacement.
                          All systems operating normally.
                        </p>
                        <div className="flex items-center mt-3">
                          <Image className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            2 photos attached
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Camera Dialog */}
        <Dialog
          open={showCameraDialog}
          onOpenChange={(open) => {
            if (!open) {
              stopCamera();
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Capture Asset Photos</DialogTitle>
              <DialogDescription>
                Take photos of the asset (up to 5). Recommended: four corners
                and nameplate. Photos captured: {capturedPhotos.length}/5
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-md bg-black"
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {capturedPhotos.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Captured Photos:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {capturedPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square overflow-hidden rounded border"
                      >
                        <img
                          src={photo.url}
                          alt={`Captured ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        {photo.id === mainImageId && (
                          <div className="absolute top-1 right-1">
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Main
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={stopCamera}>
                {capturedPhotos.length > 0 ? "Done" : "Cancel"}
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={capturedPhotos.length >= 5}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo ({capturedPhotos.length}/5)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AssetDetail;
