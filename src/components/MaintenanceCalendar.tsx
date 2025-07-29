import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Settings, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface MaintenanceEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  assetId: string;
  assetName: string;
  assetType: string;
  taskType: "quarterly" | "annual" | "custom";
  hvacSubTypes?: string[];
  status: "scheduled" | "completed" | "overdue";
  description?: string;
  assignedTo?: string;
}

const HVAC_SUB_TYPES = [
  "Air Handler Unit (AHU)",
  "Variable Air Volume (VAV)",
  "Fan Coil Unit (FCU)",
  "Heat Pump",
  "Chiller",
  "Boiler",
  "Cooling Tower",
  "Rooftop Unit (RTU)",
  "Split System"
];

const ASSET_TYPES = [
  "HVAC System",
  "Generator",
  "Elevator",
  "Fire Safety",
  "Electrical",
  "Plumbing",
  "Security",
  "Other"
];

const MaintenanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [events, setEvents] = useState<MaintenanceEvent[]>([
    {
      id: "1",
      title: "HVAC Quarterly Maintenance",
      date: "2024-01-15",
      time: "09:00",
      assetId: "hvac-001",
      assetName: "HVAC Unit A1",
      assetType: "HVAC System",
      taskType: "quarterly",
      hvacSubTypes: ["Air Handler Unit (AHU)", "Variable Air Volume (VAV)"],
      status: "scheduled",
      description: "Quarterly maintenance check for HVAC systems",
      assignedTo: "John Smith"
    },
    {
      id: "2",
      title: "Generator Annual Service",
      date: "2024-01-20",
      time: "14:00",
      assetId: "gen-001",
      assetName: "Generator B2",
      assetType: "Generator",
      taskType: "annual",
      status: "scheduled",
      description: "Annual service and inspection",
      assignedTo: "Mike Johnson"
    }
  ]);

  // Form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    assetName: "",
    assetType: "",
    taskType: "custom" as "quarterly" | "annual" | "custom",
    hvacSubTypes: [] as string[],
    description: "",
    assignedTo: ""
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleScheduleTask = () => {
    const eventId = Date.now().toString();
    const newMaintenanceEvent: MaintenanceEvent = {
      id: eventId,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      assetId: eventId,
      assetName: newEvent.assetName,
      assetType: newEvent.assetType,
      taskType: newEvent.taskType,
      hvacSubTypes: newEvent.assetType === "HVAC System" ? newEvent.hvacSubTypes : undefined,
      status: "scheduled",
      description: newEvent.description,
      assignedTo: newEvent.assignedTo
    };

    setEvents([...events, newMaintenanceEvent]);
    setIsScheduleDialogOpen(false);
    
    // Reset form
    setNewEvent({
      title: "",
      date: "",
      time: "",
      assetName: "",
      assetType: "",
      taskType: "custom",
      hvacSubTypes: [],
      description: "",
      assignedTo: ""
    });
  };

  const handleHvacSubTypeChange = (subType: string, checked: boolean) => {
    if (checked) {
      setNewEvent(prev => ({
        ...prev,
        hvacSubTypes: [...prev.hvacSubTypes, subType]
      }));
    } else {
      setNewEvent(prev => ({
        ...prev,
        hvacSubTypes: prev.hvacSubTypes.filter(type => type !== subType)
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      
      days.push(
        <div
          key={day}
          className={`h-24 border border-border p-1 cursor-pointer hover:bg-accent ${isToday ? 'bg-primary/10' : ''}`}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded text-white truncate ${getStatusColor(event.status)}`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-background w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Calendar className="mr-2 h-6 w-6" />
          Maintenance Calendar
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsScheduleDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Task
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center font-medium text-sm border border-border bg-muted">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">
            {renderCalendarGrid()}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Task Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Task Title</Label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label>Asset Name</Label>
                <Input
                  value={newEvent.assetName}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, assetName: e.target.value }))}
                  placeholder="Enter asset name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Asset Type</Label>
                <Select value={newEvent.assetType} onValueChange={(value) => setNewEvent(prev => ({ ...prev, assetType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Task Type</Label>
                <Select value={newEvent.taskType} onValueChange={(value: "quarterly" | "annual" | "custom") => setNewEvent(prev => ({ ...prev, taskType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newEvent.assetType === "HVAC System" && (
              <div>
                <Label>HVAC Sub-Asset Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {HVAC_SUB_TYPES.map(subType => (
                    <div key={subType} className="flex items-center space-x-2">
                      <Checkbox
                        id={subType}
                        checked={newEvent.hvacSubTypes.includes(subType)}
                        onCheckedChange={(checked) => handleHvacSubTypeChange(subType, checked as boolean)}
                      />
                      <Label htmlFor={subType} className="text-sm">{subType}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Assigned To</Label>
              <Input
                value={newEvent.assignedTo}
                onChange={(e) => setNewEvent(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Enter technician name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleTask}>
              Schedule Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceCalendar;