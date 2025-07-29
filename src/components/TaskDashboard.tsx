import React, { useState } from "react";
import { Clock, AlertTriangle, CheckCircle, User, Calendar, Filter, Search, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface Task {
  id: string;
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  assetType: string;
  assignedTo: string;
  assignedDate: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "overdue";
  taskType: "quarterly" | "annual" | "custom" | "emergency";
  estimatedDuration: string;
  completedDate?: string;
  completionNotes?: string;
  location: string;
}

const TaskDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const tasks: Task[] = [
    {
      id: "1",
      title: "HVAC Filter Replacement",
      description: "Replace air filters in all HVAC units and check system performance",
      assetId: "hvac-001",
      assetName: "HVAC Unit A1",
      assetType: "HVAC System",
      assignedTo: "John Smith",
      assignedDate: "2024-01-10",
      dueDate: "2024-01-15",
      priority: "high",
      status: "overdue",
      taskType: "quarterly",
      estimatedDuration: "2 hours",
      location: "Building A - Roof"
    },
    {
      id: "2",
      title: "Generator Oil Change",
      description: "Scheduled oil change and fluid level check for backup generator",
      assetId: "gen-001",
      assetName: "Generator B2",
      assetType: "Generator",
      assignedTo: "Mike Johnson",
      assignedDate: "2024-01-12",
      dueDate: "2024-01-20",
      priority: "medium",
      status: "in-progress",
      taskType: "quarterly",
      estimatedDuration: "3 hours",
      location: "Building B - Basement"
    },
    {
      id: "3",
      title: "Elevator Safety Inspection",
      description: "Annual safety inspection and certification for passenger elevator",
      assetId: "elev-001",
      assetName: "Elevator C1",
      assetType: "Elevator",
      assignedTo: "Sarah Wilson",
      assignedDate: "2024-01-08",
      dueDate: "2024-01-25",
      priority: "high",
      status: "pending",
      taskType: "annual",
      estimatedDuration: "4 hours",
      location: "Building C - Main"
    },
    {
      id: "4",
      title: "Fire Panel Battery Test",
      description: "Test backup battery and alarm systems for fire safety panel",
      assetId: "fire-001",
      assetName: "Fire Panel D1",
      assetType: "Fire Safety",
      assignedTo: "Tom Brown",
      assignedDate: "2024-01-14",
      dueDate: "2024-01-28",
      priority: "medium",
      status: "pending",
      taskType: "quarterly",
      estimatedDuration: "1.5 hours",
      location: "Building D - Lobby"
    },
    {
      id: "5",
      title: "Emergency Lighting Check",
      description: "Monthly emergency lighting system test and battery check",
      assetId: "light-001",
      assetName: "Emergency Lighting System",
      assetType: "Electrical",
      assignedTo: "John Smith",
      assignedDate: "2024-01-05",
      dueDate: "2024-01-18",
      priority: "low",
      status: "completed",
      taskType: "custom",
      estimatedDuration: "1 hour",
      completedDate: "2024-01-16",
      completionNotes: "All emergency lights tested successfully. Battery levels good.",
      location: "All Buildings"
    },
    {
      id: "6",
      title: "Water Leak Repair",
      description: "Emergency repair for water leak in basement plumbing",
      assetId: "plumb-001",
      assetName: "Main Water Line",
      assetType: "Plumbing",
      assignedTo: "Mike Johnson",
      assignedDate: "2024-01-16",
      dueDate: "2024-01-16",
      priority: "high",
      status: "completed",
      taskType: "emergency",
      estimatedDuration: "6 hours",
      completedDate: "2024-01-16",
      completionNotes: "Leak repaired successfully. No further issues detected.",
      location: "Building A - Basement"
    }
  ];

  const technicians = ["John Smith", "Mike Johnson", "Sarah Wilson", "Tom Brown"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'quarterly': return 'text-blue-600 bg-blue-100';
      case 'annual': return 'text-purple-600 bg-purple-100';
      case 'custom': return 'text-gray-600 bg-gray-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === "all" || task.assignedTo === filterAssignee;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const overdueTasks = tasks.filter(task => task.status === 'overdue');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const upcomingTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3 && (task.status === 'pending' || task.status === 'in-progress');
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-background w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</p>
              </div>
              <User className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingTasks.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="upcoming">Due Soon</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Maintenance Tasks</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {technicians.map(tech => (
                        <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTasks.map(task => {
                  const daysUntilDue = getDaysUntilDue(task.dueDate);
                  
                  return (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.assetName} • {task.location}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned: {formatDate(task.assignedDate)} • Est: {task.estimatedDuration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTaskTypeColor(task.taskType)}>
                          {task.taskType}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{task.assignedTo}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.status === 'completed' ? 
                              `Completed: ${formatDate(task.completedDate!)}` :
                              daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                              daysUntilDue === 0 ? 'Due today' : 
                              `Due: ${formatDate(task.dueDate)}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents would be similar but filtered */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => handleTaskClick(task)}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.assetName}</p>
                        <p className="text-xs text-muted-foreground">Assigned to: {task.assignedTo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <p className="text-sm font-medium mt-1">Due: {formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Tasks ({overdueTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueTasks.map(task => {
                  const daysOverdue = Math.abs(getDaysUntilDue(task.dueDate));
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-accent cursor-pointer" onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.assetName}</p>
                          <p className="text-xs text-muted-foreground">Assigned to: {task.assignedTo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="text-red-600 bg-red-100">{daysOverdue} days overdue</Badge>
                        <p className="text-sm font-medium mt-1">Was due: {formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Due Soon ({upcomingTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map(task => {
                  const daysUntilDue = getDaysUntilDue(task.dueDate);
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg hover:bg-accent cursor-pointer" onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.assetName}</p>
                          <p className="text-xs text-muted-foreground">Assigned to: {task.assignedTo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="text-orange-600 bg-orange-100">
                          {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
                        </Badge>
                        <p className="text-sm font-medium mt-1">Due: {formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Detail Dialog */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Asset</Label>
                  <p className="text-sm">{selectedTask.assetName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm">{selectedTask.location}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm">{selectedTask.assignedTo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estimated Duration</Label>
                  <p className="text-sm">{selectedTask.estimatedDuration}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge className={getTaskTypeColor(selectedTask.taskType)}>
                    {selectedTask.taskType}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Assigned Date</Label>
                  <p className="text-sm">{formatDate(selectedTask.assignedDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm">{formatDate(selectedTask.dueDate)}</p>
                </div>
              </div>

              {selectedTask.completedDate && (
                <div>
                  <Label className="text-sm font-medium">Completed Date</Label>
                  <p className="text-sm">{formatDate(selectedTask.completedDate)}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              </div>

              {selectedTask.completionNotes && (
                <div>
                  <Label className="text-sm font-medium">Completion Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedTask.completionNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>
              Close
            </Button>
            {selectedTask?.status !== 'completed' && (
              <Button>Update Task</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDashboard;