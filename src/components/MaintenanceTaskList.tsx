import React, { useState } from "react";
import { PlusCircle, CheckCircle, Circle, Camera, Trash2, ChevronDown, ChevronRight, Send, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase, hasSupabaseCredentials } from "@/lib/supabase";

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  photos?: string[];
}

interface ChecklistTask {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

interface HVACChecklist {
  id: string;
  name: string;
  quarterlyTasks: ChecklistTask[];
  annualTasks: ChecklistTask[];
  generalNotes: string;
}

const HVAC_CHECKLISTS: HVACChecklist[] = [
  {
    id: "ahu",
    name: "Air Handling Unit (AHU)",
    quarterlyTasks: [
      { id: "ahu-q1", title: "Inspect and replace filters as needed.", completed: false },
      { id: "ahu-q2", title: "Check and clean condensate drain pans and lines.", completed: false },
      { id: "ahu-q3", title: "Inspect belts and pulleys; adjust or replace if worn.", completed: false },
      { id: "ahu-q4", title: "Lubricate bearings and moving parts as recommended.", completed: false },
      { id: "ahu-q5", title: "Inspect electrical connections for tightness and wear.", completed: false },
    ],
    annualTasks: [
      { id: "ahu-a1", title: "Inspect coils for cleanliness and clean as needed.", completed: false },
      { id: "ahu-a2", title: "Check fan blades and housing for wear and balance.", completed: false },
      { id: "ahu-a3", title: "Inspect and calibrate sensors and controls.", completed: false },
      { id: "ahu-a4", title: "Inspect and tighten all electrical connections.", completed: false },
      { id: "ahu-a5", title: "Verify operation of dampers and actuators.", completed: false },
    ],
    generalNotes: ""
  },
  {
    id: "boiler",
    name: "Boiler",
    quarterlyTasks: [
      { id: "boiler-q1", title: "Inspect safety and relief valves.", completed: false },
      { id: "boiler-q2", title: "Check burner operation and flame condition.", completed: false },
      { id: "boiler-q3", title: "Inspect and clean combustion chamber if necessary.", completed: false },
      { id: "boiler-q4", title: "Inspect venting and flue for blockages.", completed: false },
    ],
    annualTasks: [
      { id: "boiler-a1", title: "Perform combustion analysis and adjust burners.", completed: false },
      { id: "boiler-a2", title: "Inspect and clean heat exchanger surfaces.", completed: false },
      { id: "boiler-a3", title: "Test low-water cutoff and safety controls.", completed: false },
      { id: "boiler-a4", title: "Drain and flush system to remove sediment.", completed: false },
    ],
    generalNotes: ""
  },
  {
    id: "chiller",
    name: "Chiller",
    quarterlyTasks: [
      { id: "chiller-q1", title: "Check refrigerant levels and pressures.", completed: false },
      { id: "chiller-q2", title: "Inspect condenser and evaporator coils for cleanliness.", completed: false },
      { id: "chiller-q3", title: "Inspect electrical connections and contactors.", completed: false },
      { id: "chiller-q4", title: "Verify proper operation of safety controls.", completed: false },
    ],
    annualTasks: [
      { id: "chiller-a1", title: "Perform full chiller efficiency analysis.", completed: false },
      { id: "chiller-a2", title: "Inspect and clean tubes and heat exchangers.", completed: false },
      { id: "chiller-a3", title: "Calibrate all control sensors and devices.", completed: false },
      { id: "chiller-a4", title: "Perform oil analysis and change as needed.", completed: false },
    ],
    generalNotes: ""
  },
  {
    id: "cooling-tower",
    name: "Cooling Tower",
    quarterlyTasks: [
      { id: "ct-q1", title: "Inspect and clean strainers and sump.", completed: false },
      { id: "ct-q2", title: "Check water treatment chemical levels.", completed: false },
      { id: "ct-q3", title: "Inspect fans and motors for wear.", completed: false },
      { id: "ct-q4", title: "Check and adjust water level.", completed: false },
    ],
    annualTasks: [
      { id: "ct-a1", title: "Inspect and clean fill media and drift eliminators.", completed: false },
      { id: "ct-a2", title: "Inspect basin and casing for corrosion.", completed: false },
      { id: "ct-a3", title: "Lubricate bearings and mechanical equipment.", completed: false },
      { id: "ct-a4", title: "Check and adjust alignment of fan and motor.", completed: false },
    ],
    generalNotes: ""
  },
  {
    id: "fcu",
    name: "Fan Coil Unit (FCU)",
    quarterlyTasks: [
      { id: "fcu-q1", title: "Inspect and replace air filters.", completed: false },
      { id: "fcu-q2", title: "Clean condensate pans and drain lines.", completed: false },
      { id: "fcu-q3", title: "Check and clean coils if necessary.", completed: false },
      { id: "fcu-q4", title: "Inspect electrical connections.", completed: false },
    ],
    annualTasks: [
      { id: "fcu-a1", title: "Check and adjust fan balance.", completed: false },
      { id: "fcu-a2", title: "Inspect and lubricate bearings.", completed: false },
      { id: "fcu-a3", title: "Verify thermostat and control operation.", completed: false },
      { id: "fcu-a4", title: "Inspect insulation and casing.", completed: false },
    ],
    generalNotes: ""
  },
  {
    id: "heat-pump",
    name: "Heat Pump",
    quarterlyTasks: [
      { id: "hp-q1", title: "Inspect filters and replace as needed.", completed: false },
      { id: "hp-q2", title: "Check refrigerant levels and pressures.", completed: false },
      { id: "hp-q3", title: "Inspect condensate drain and pan.", completed: false },
      { id: "hp-q4", title: "Inspect electrical components for wear.", completed: false },
    ],
    annualTasks: [
      { id: "hp-a1", title: "Inspect coils for cleanliness and clean as needed.", completed: false },
      { id: "hp-a2", title: "Verify defrost controls and cycle operation.", completed: false },
      { id: "hp-a3", title: "Lubricate motor and bearings if required.", completed: false },
      { id: "hp-a4", title: "Inspect and calibrate thermostat.", completed: false },
    ],
    generalNotes: ""
  },
  {
    id: "rtu",
    name: "Rooftop Package Unit (RTU)",
    quarterlyTasks: [
      { id: "rtu-q1", title: "Replace or clean filters.", completed: false },
      { id: "rtu-q2", title: "Inspect belts and adjust or replace.", completed: false },
      { id: "rtu-q3", title: "Check refrigerant charge and pressures.", completed: false },
      { id: "rtu-q4", title: "Inspect and clean condensate drain.", completed: false },
    ],
    annualTasks: [
      { id: "rtu-a1", title: "Inspect heat exchanger or burners.", completed: false },
      { id: "rtu-a2", title: "Check electrical connections and contactors.", completed: false },
      { id: "rtu-a3", title: "Inspect and clean coils.", completed: false },
      { id: "rtu-a4", title: "Calibrate controls and thermostats.", completed: false },
    ],
    generalNotes: ""
  },
  {
    id: "split-system",
    name: "Split System",
    quarterlyTasks: [
      { id: "ss-q1", title: "Check air filters and replace as needed.", completed: false },
      { id: "ss-q2", title: "Inspect condenser and evaporator coils.", completed: false },
      { id: "ss-q3", title: "Check refrigerant lines for leaks.", completed: false },
      { id: "ss-q4", title: "Inspect electrical connections.", completed: false },
    ],
    annualTasks: [
      { id: "ss-a1", title: "Perform refrigerant charge analysis.", completed: false },
      { id: "ss-a2", title: "Inspect and clean blower components.", completed: false },
      { id: "ss-a3", title: "Calibrate thermostats and controls.", completed: false },
      { id: "ss-a4", title: "Lubricate fan and motor bearings if applicable.", completed: false },
    ],
    generalNotes: ""
  },
  {
    id: "vrf",
    name: "VRF (Variable Refrigerant Flow)",
    quarterlyTasks: [
      { id: "vrf-q1", title: "Inspect filters and clean or replace.", completed: false },
      { id: "vrf-q2", title: "Check indoor unit condensate drains.", completed: false },
      { id: "vrf-q3", title: "Inspect refrigerant line insulation.", completed: false },
      { id: "vrf-q4", title: "Inspect electrical connections and terminal blocks.", completed: false },
    ],
    annualTasks: [
      { id: "vrf-a1", title: "Check refrigerant charge and balance.", completed: false },
      { id: "vrf-a2", title: "Inspect and clean heat exchangers.", completed: false },
      { id: "vrf-a3", title: "Verify operation of control systems and sensors.", completed: false },
      { id: "vrf-a4", title: "Inspect outdoor unit for debris and corrosion.", completed: false },
    ],
    generalNotes: ""
  }
];

interface MaintenanceTaskListProps {
  assetId?: string;
  tasks?: MaintenanceTask[];
  onTaskComplete?: (taskId: string, notes: string, photos: string[]) => void;
  onTaskAdd?: (
    task: Omit<
      MaintenanceTask,
      "id" | "completed" | "completedAt" | "completedBy" | "notes" | "photos"
    >,
  ) => void;
  onTaskDelete?: (taskId: string) => void;
}

const MaintenanceTaskList = ({
  assetId = "123",
  tasks: initialTasks = [
    {
      id: "1",
      title: "Check oil level",
      description: "Verify oil level is within acceptable range",
      dueDate: "2023-06-15",
      completed: false,
    },
    {
      id: "2",
      title: "Replace air filter",
      description: "Remove old filter and install new one",
      dueDate: "2023-06-20",
      completed: false,
    },
    {
      id: "3",
      title: "Inspect belts",
      description: "Check for wear and proper tension",
      dueDate: "2023-06-10",
      completed: true,
      completedAt: "2023-06-09T14:30:00",
      completedBy: "John Doe",
      notes: "Belts in good condition, no replacement needed",
    },
  ],
  onTaskComplete = () => {},
  onTaskAdd = () => {},
  onTaskDelete = () => {},
}: MaintenanceTaskListProps) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);
  const [hvacChecklists, setHvacChecklists] = useState<HVACChecklist[]>(HVAC_CHECKLISTS);
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null,
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [technicianName, setTechnicianName] = useState("");
  const [generalReportNotes, setGeneralReportNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleAddTask = () => {
    const newTask = {
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: newTaskDueDate,
    };

    onTaskAdd(newTask);

    // For demo purposes, we'll add it to our local state
    const taskWithId = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
    };

    setTasks([...tasks, taskWithId]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setIsAddDialogOpen(false);
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;

    onTaskComplete(selectedTask.id, completionNotes, completionPhotos);

    // For demo purposes, update local state
    const updatedTasks = tasks.map((task) => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          completed: true,
          completedAt: new Date().toISOString(),
          completedBy: "Current User",
          notes: completionNotes,
          photos: completionPhotos,
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    setCompletionNotes("");
    setCompletionPhotos([]);
    setIsCompleteDialogOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    onTaskDelete(taskId);

    // For demo purposes, update local state
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const openCompleteDialog = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setCompletionNotes(task.notes || "");
    setCompletionPhotos(task.photos || []);
    setIsCompleteDialogOpen(true);
  };

  const addMockPhoto = () => {
    const mockPhotoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    setCompletionPhotos([...completionPhotos, mockPhotoUrl]);
  };

  const toggleChecklistExpansion = (checklistId: string) => {
    const newExpanded = new Set(expandedChecklists);
    if (newExpanded.has(checklistId)) {
      newExpanded.delete(checklistId);
    } else {
      newExpanded.add(checklistId);
    }
    setExpandedChecklists(newExpanded);
  };

  const toggleChecklistTask = (checklistId: string, taskId: string, isQuarterly: boolean) => {
    setHvacChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        const tasksToUpdate = isQuarterly ? checklist.quarterlyTasks : checklist.annualTasks;
        const updatedTasks = tasksToUpdate.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        
        return {
          ...checklist,
          [isQuarterly ? 'quarterlyTasks' : 'annualTasks']: updatedTasks
        };
      }
      return checklist;
    }));
  };

  const updateChecklistNotes = (checklistId: string, notes: string) => {
    setHvacChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId ? { ...checklist, generalNotes: notes } : checklist
    ));
  };

  const updateTaskNotes = (checklistId: string, taskId: string, notes: string, isQuarterly: boolean) => {
    setHvacChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        const tasksToUpdate = isQuarterly ? checklist.quarterlyTasks : checklist.annualTasks;
        const updatedTasks = tasksToUpdate.map(task => 
          task.id === taskId ? { ...task, notes } : task
        );
        
        return {
          ...checklist,
          [isQuarterly ? 'quarterlyTasks' : 'annualTasks']: updatedTasks
        };
      }
      return checklist;
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isPastDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today && !isToday(due);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDueDateStatus = (dueDate: string, completed: boolean) => {
    if (completed) return { text: "Completed", variant: "secondary" as const };
    if (isPastDue(dueDate))
      return { text: "Past Due", variant: "destructive" as const };
    if (isToday(new Date(dueDate)))
      return { text: "Due Today", variant: "default" as const };
    return { text: "Upcoming", variant: "outline" as const };
  };

  const submitMaintenanceReport = async () => {
    if (!hasSupabaseCredentials) {
      setSubmitMessage("Database connection not configured. Report saved locally.");
      setTimeout(() => setSubmitMessage(""), 5000);
      setIsSubmitDialogOpen(false);
      return;
    }

    if (!technicianName.trim()) {
      setSubmitMessage("Please enter technician name.");
      setTimeout(() => setSubmitMessage(""), 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare HVAC checklist data
      const hvacData = hvacChecklists.map(checklist => ({
        id: checklist.id,
        name: checklist.name,
        quarterlyTasks: checklist.quarterlyTasks,
        annualTasks: checklist.annualTasks,
        generalNotes: checklist.generalNotes,
        quarterlyCompleted: checklist.quarterlyTasks.filter(t => t.completed).length,
        annualCompleted: checklist.annualTasks.filter(t => t.completed).length,
        totalQuarterly: checklist.quarterlyTasks.length,
        totalAnnual: checklist.annualTasks.length
      }));

      // Prepare custom tasks data
      const customTasksData = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        completed: task.completed,
        completedAt: task.completedAt,
        completedBy: task.completedBy,
        notes: task.notes,
        photos: task.photos
      }));

      // Submit to database
      const { data, error } = await supabase
        .from('maintenance_reports')
        .insert({
          asset_id: assetId,
          report_type: 'combined',
          hvac_checklist_data: hvacData,
          custom_tasks_data: customTasksData,
          general_notes: generalReportNotes,
          technician_name: technicianName,
          submitted_at: new Date().toISOString()
        })
        .select();

      if (error) {
        throw error;
      }

      setSubmitMessage(`Maintenance report submitted successfully! Report ID: ${data[0]?.id || 'N/A'}`);
      setTimeout(() => setSubmitMessage(""), 5000);
      setIsSubmitDialogOpen(false);
      
      // Reset form
      setTechnicianName("");
      setGeneralReportNotes("");

    } catch (error) {
      console.error('Error submitting maintenance report:', error);
      setSubmitMessage("Error submitting report. Please try again.");
      setTimeout(() => setSubmitMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Maintenance Tasks</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Button>
          <Button onClick={() => setIsSubmitDialogOpen(true)} variant="default" className="bg-green-600 hover:bg-green-700">
            <Send className="mr-2 h-4 w-4" /> Submit Report
          </Button>
        </div>
      </div>

      {submitMessage && (
        <Alert className="mb-4">
          <AlertDescription>{submitMessage}</AlertDescription>
        </Alert>
      )}

      {/* HVAC Maintenance Checklists */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">HVAC Maintenance Checklists</h3>
        <div className="space-y-4">
          {hvacChecklists.map((checklist) => {
            const isExpanded = expandedChecklists.has(checklist.id);
            const quarterlyCompleted = checklist.quarterlyTasks.filter(t => t.completed).length;
            const annualCompleted = checklist.annualTasks.filter(t => t.completed).length;
            const totalQuarterly = checklist.quarterlyTasks.length;
            const totalAnnual = checklist.annualTasks.length;

            return (
              <Card key={checklist.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleChecklistExpansion(checklist.id)}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <CardTitle className="text-lg">{checklist.name}</CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">
                        Quarterly: {quarterlyCompleted}/{totalQuarterly}
                      </Badge>
                      <Badge variant="outline">
                        Annual: {annualCompleted}/{totalAnnual}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Quarterly Tasks */}
                      <div>
                        <h4 className="font-medium text-base mb-3 text-blue-700">Quarterly Maintenance</h4>
                        <div className="space-y-2">
                          {checklist.quarterlyTasks.map((task) => (
                            <div key={task.id} className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleChecklistTask(checklist.id, task.id, true)}
                                  className="mt-0.5"
                                />
                                <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                              </div>
                              {task.completed && (
                                <Textarea
                                  placeholder="Add notes for this task..."
                                  value={task.notes || ''}
                                  onChange={(e) => updateTaskNotes(checklist.id, task.id, e.target.value, true)}
                                  className="ml-6 text-xs min-h-[60px]"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Annual Tasks */}
                      <div>
                        <h4 className="font-medium text-base mb-3 text-green-700">Annual Maintenance</h4>
                        <div className="space-y-2">
                          {checklist.annualTasks.map((task) => (
                            <div key={task.id} className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleChecklistTask(checklist.id, task.id, false)}
                                  className="mt-0.5"
                                />
                                <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                              </div>
                              {task.completed && (
                                <Textarea
                                  placeholder="Add notes for this task..."
                                  value={task.notes || ''}
                                  onChange={(e) => updateTaskNotes(checklist.id, task.id, e.target.value, false)}
                                  className="ml-6 text-xs min-h-[60px]"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* General Notes */}
                    <div className="mt-6">
                      <label className="text-sm font-medium mb-2 block">General Notes:</label>
                      <Textarea
                        placeholder="Add general notes for this unit..."
                        value={checklist.generalNotes}
                        onChange={(e) => updateChecklistNotes(checklist.id, e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Custom Tasks Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Custom Tasks</h3>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground">No maintenance tasks found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const status = getDueDateStatus(task.dueDate, task.completed);

              return (
                <Card
                  key={task.id}
                  className={`${task.completed ? "bg-muted/30" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() =>
                            !task.completed && openCompleteDialog(task)
                          }
                          className="mt-1 text-primary"
                          disabled={task.completed}
                        >
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                        <div>
                          <h3
                            className={`font-medium text-lg ${task.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant={status.variant}>{status.text}</Badge>
                            <Badge variant="outline">
                              Due: {formatDate(task.dueDate)}
                            </Badge>

                            {task.completed && task.completedAt && (
                              <Badge variant="secondary">
                                Completed: {formatDate(task.completedAt)}
                              </Badge>
                            )}
                          </div>

                          {task.completed && task.notes && (
                            <div className="mt-3 p-2 bg-muted rounded-md">
                              <p className="text-sm">{task.notes}</p>
                            </div>
                          )}

                          {task.completed &&
                            task.photos &&
                            task.photos.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {task.photos.map((photo, index) => (
                                  <div
                                    key={index}
                                    className="relative w-16 h-16 rounded-md overflow-hidden"
                                  >
                                    <img
                                      src={photo}
                                      alt="Task completion"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add completion notes..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Photos</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {completionPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-16 rounded-md overflow-hidden"
                  >
                    <img
                      src={photo}
                      alt="Completion"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addMockPhoto}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" /> Add Photo
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCompleteTask}>Complete Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Maintenance Report Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="mr-2 h-5 w-5" />
              Submit Maintenance Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium flex items-center mb-2">
                <User className="mr-1 h-4 w-4" />
                Technician Name *
              </label>
              <Input
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">General Report Notes</label>
              <Textarea
                value={generalReportNotes}
                onChange={(e) => setGeneralReportNotes(e.target.value)}
                placeholder="Add any general observations or notes about the maintenance session..."
                className="min-h-[100px]"
              />
            </div>

            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Report Summary:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• HVAC Checklists: {hvacChecklists.length} units</p>
                <p>• Custom Tasks: {tasks.length} tasks ({tasks.filter(t => t.completed).length} completed)</p>
                <p>• Submission Time: {new Date().toLocaleString()}</p>
              </div>
            </div>

            {!hasSupabaseCredentials && (
              <Alert>
                <AlertDescription>
                  Database not connected. Report will be saved locally for demonstration.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitMaintenanceReport}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceTaskList;