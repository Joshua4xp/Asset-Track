import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, Upload, X, Camera } from "lucide-react";

interface ServiceLogFormProps {
  assetId?: string;
  onSubmit?: (data: ServiceLogData) => void;
  onCancel?: () => void;
}

export interface ServiceLogData {
  assetId: string;
  date: Date;
  time: string;
  serviceType: string;
  technician: string;
  notes: string;
  photos: string[];
}

const ServiceLogForm = ({
  assetId = "default-asset",
  onSubmit,
  onCancel,
}: ServiceLogFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(format(new Date(), "HH:mm"));
  const [serviceType, setServiceType] = useState<string>("");
  const [technician, setTechnician] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);

  // Mock service types
  const serviceTypes = [
    "Routine Maintenance",
    "Repair",
    "Inspection",
    "Replacement",
    "Upgrade",
    "Emergency Service",
  ];

  const handleAddPhoto = () => {
    // In a real implementation, this would open the camera or file picker
    // For now, we'll just add a placeholder image URL
    const newPhotoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    setPhotos([...photos, newPhotoUrl]);
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const serviceLogData: ServiceLogData = {
      assetId,
      date,
      time,
      serviceType,
      technician,
      notes,
      photos,
    };

    if (onSubmit) {
      onSubmit(serviceLogData);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Service Log</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Service Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="time">Service Time</Label>
              <div className="flex items-center border rounded-md">
                <div className="px-3 py-2 bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-0"
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger id="serviceType">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Technician */}
            <div className="space-y-2">
              <Label htmlFor="technician">Technician</Label>
              <Input
                id="technician"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Enter technician name"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter service notes and observations"
              rows={4}
            />
          </div>

          {/* Photo Attachments */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Service photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-24 border-dashed flex flex-col items-center justify-center gap-1"
                onClick={handleAddPhoto}
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs">Add Photo</span>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          Save Service Log
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceLogForm;
