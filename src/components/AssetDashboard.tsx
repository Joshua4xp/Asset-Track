import React, { useState } from "react";
import { AlertTriangle, Clock, CheckCircle, Building2, Filter, Search, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "operational" | "maintenance" | "offline";
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceType: "quarterly" | "annual" | "custom";
  priority: "high" | "medium" | "low";
  assignedTechnician?: string;
  image?: string;
}

interface PendingTask {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  assetType: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  assignedTo: string;
  status: "pending" | "in-progress" | "overdue";
  description: string;
}

const AssetDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const assets: Asset[] = [
    {
      id: "1",
      name: "HVAC Unit A1",
      type: "HVAC System",
      location: "Building A - Roof",
      status: "maintenance",
      lastMaintenance: "2023-12-15",
      nextMaintenance: "2024-01-15",
      maintenanceType: "quarterly",
      priority: "high",
      assignedTechnician: "John Smith"
    },
    {
      id: "2",
      name: "Generator B2",
      type: "Generator",
      location: "Building B - Basement",
      status: "operational",
      lastMaintenance: "2023-11-20",
      nextMaintenance: "2024-02-20",
      maintenanceType: "quarterly",
      priority: "medium",
      assignedTechnician: "Mike Johnson"
    },
    {
      id: "3",
      name: "Elevator C1",
      type: "Elevator",
      location: "Building C - Main",
      status: "offline",
      lastMaintenance: "2023-10-10",
      nextMaintenance: "2024-01-10",
      maintenanceType: "annual",
      priority: "high",
      assignedTechnician: "Sarah Wilson"
    },
    {
      id: "4",
      name: "Fire Panel D1",
      type: "Fire Safety",
      location: "Building D - Lobby",
      status: "operational",
      lastMaintenance: "2023-12-01",
      nextMaintenance: "2024-03-01",
      maintenanceType: "quarterly",
      priority: "low"
    }
  ];

  const pendingTasks: PendingTask[] = [
    {
      id: "1",
      title: "Filter Replacement",
      assetId: "1",
      assetName: "HVAC Unit A1",
      assetType: "HVAC System",
      dueDate: "2024-01-15",
      priority: "high",
      assignedTo: "John Smith",
      status: "overdue",
      description: "Replace air filters and check system performance"
    },
    {
      id: "2",
      title: "Oil Change",
      assetId: "2",
      assetName: "Generator B2",
      assetType: "Generator",
      dueDate: "2024-01-20",
      priority: "medium",
      assignedTo: "Mike Johnson",
      status: "pending",
      description: "Scheduled oil change and fluid level check"
    },
    {
      id: "3",
      title: "Safety Inspection",
      assetId: "3",
      assetName: "Elevator C1",
      assetType: "Elevator",
      dueDate: "2024-01-10",
      priority: "high",
      assignedTo: "Sarah Wilson",
      status: "in-progress",
      description: "Annual safety inspection and certification"
    },
    {
      id: "4",
      title: "Battery Test",
      assetId: "4",
      assetName: "Fire Panel D1",
      assetType: "Fire Safety",
      dueDate: "2024-01-25",
      priority: "medium",
      assignedTo: "Tom Brown",
      status: "pending",
      description: "Test backup battery and alarm systems"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || asset.type === filterType;
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const assetsNeedingMaintenance = assets.filter(asset => {
    const nextMaintenanceDate = new Date(asset.nextMaintenance);
    const today = new Date();
    const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilMaintenance <= 7 || asset.status === 'maintenance';
  });

  const overdueTasks = pendingTasks.filter(task => task.status === 'overdue');
  const upcomingTasks = pendingTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3 && task.status === 'pending';
  });

  return (
    <div className="bg-background w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Asset Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{assetsNeedingMaintenance.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold text-green-600">
                  {assets.filter(a => a.status === 'operational').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assets">All Assets</TabsTrigger>
          <TabsTrigger value="maintenance">Need Maintenance</TabsTrigger>
          <TabsTrigger value="tasks">Pending Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Asset Overview</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Asset Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="HVAC System">HVAC System</SelectItem>
                      <SelectItem value="Generator">Generator</SelectItem>
                      <SelectItem value="Elevator">Elevator</SelectItem>
                      <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{asset.name}</h3>
                        <p className="text-sm text-muted-foreground">{asset.location}</p>
                        <p className="text-xs text-muted-foreground">
                          Last maintenance: {new Date(asset.lastMaintenance).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(asset.priority)}>
                        {asset.priority}
                      </Badge>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">Next: {new Date(asset.nextMaintenance).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{asset.maintenanceType}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assets Requiring Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assetsNeedingMaintenance.map(asset => {
                  const nextMaintenanceDate = new Date(asset.nextMaintenance);
                  const today = new Date();
                  const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysUntilMaintenance < 0;
                  
                  return (
                    <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground">{asset.location}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned to: {asset.assignedTechnician || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={isOverdue ? 'text-red-600 bg-red-100' : 'text-yellow-600 bg-yellow-100'}>
                          {isOverdue ? `${Math.abs(daysUntilMaintenance)} days overdue` : `${daysUntilMaintenance} days`}
                        </Badge>
                        <Badge className={getPriorityColor(asset.priority)}>
                          {asset.priority}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{asset.maintenanceType}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {nextMaintenanceDate.toLocaleDateString()}
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

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Maintenance Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map(task => {
                  const dueDate = new Date(task.dueDate);
                  const today = new Date();
                  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.assetName}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned to: {task.assignedTo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                             daysUntilDue === 0 ? 'Due today' : 
                             `${daysUntilDue} days left`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {dueDate.toLocaleDateString()}
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
      </Tabs>
    </div>
  );
};

export default AssetDashboard;