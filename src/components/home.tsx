import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  Plus,
  History,
  Settings,
  Search,
  Building2,
  Camera,
  Calendar,
  BarChart3,
  ClipboardList,
  LogOut,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectSelector from "./ProjectSelector";
import CurrentAssets from "./CurrentAssets";
import ProjectDropdown from "./ProjectDropdown";

import { Project, AssetWithProject } from "@/types/supabase";
import { useAuth } from "./AuthProvider";

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const pendingTasks = [
    {
      id: "1",
      task: "HVAC Filter Replacement",
      asset: "HVAC Unit A1",
      dueDate: "Jan 15",
    },
    {
      id: "2",
      task: "Generator Oil Change",
      asset: "Generator B2",
      dueDate: "Jan 20",
    },
    {
      id: "3",
      task: "Elevator Safety Check",
      asset: "Elevator C1",
      dueDate: "Jan 25",
    },
  ];

  const handleAssetSelect = (asset: AssetWithProject) => {
    navigate(`/asset/${asset.id}`);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with user info and logout */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Asset Management</h1>
              <p className="text-sm text-muted-foreground">
                QR Code Asset Tracking & Maintenance
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Current Assets</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Project Selection */}
            <div className="bg-card p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Project Selection</h2>
                  <p className="text-sm text-muted-foreground">
                    Select a project to view its assets and maintenance data
                  </p>
                </div>
                <ProjectDropdown
                  selectedProjectId={selectedProject?.id}
                  onProjectSelect={setSelectedProject}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* QR Scanner Card */}
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/scan")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    Scan QR Code
                  </CardTitle>
                  <CardDescription>
                    Scan asset QR codes to view details or assign new assets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Open Scanner
                  </Button>
                </CardContent>
              </Card>

              {/* Maintenance Calendar Card */}
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/maintenance-calendar")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Maintenance Calendar
                  </CardTitle>
                  <CardDescription>
                    Schedule and view all maintenance tasks and repairs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </CardContent>
              </Card>

              {/* Asset Dashboard Card */}
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/asset-dashboard")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Asset Dashboard
                  </CardTitle>
                  <CardDescription>
                    Monitor all assets and maintenance requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Building2 className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Task Dashboard Card */}
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/task-dashboard")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-orange-600" />
                    Task Dashboard
                  </CardTitle>
                  <CardDescription>
                    Manage pending tasks and track assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    View Tasks
                  </Button>
                </CardContent>
              </Card>

              {/* QR Code Manager Card */}
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/qr-manager")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    QR Code Manager
                  </CardTitle>
                  <CardDescription>
                    Generate and manage QR codes for asset tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage QR Codes
                  </Button>
                </CardContent>
              </Card>

              {/* Maintenance Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Overview</CardTitle>
                  <CardDescription>
                    Quick access to maintenance features and pending tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => navigate("/maintenance-tasks")}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Maintenance Task List
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => navigate("/maintenance-calendar")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="ghost"
                      onClick={() => navigate("/asset-dashboard")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Asset Status
                    </Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Pending Tasks</h4>
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="p-3 rounded-lg border">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium">{task.task}</h3>
                          <Badge variant="outline">{task.dueDate}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.asset}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    onClick={() => navigate("/task-dashboard")}
                  >
                    <Plus className="h-4 w-4" /> View All Tasks
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets">
            <CurrentAssets
              selectedProjectId={selectedProject?.id}
              onAssetSelect={handleAssetSelect}
            />
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Management</CardTitle>
                <CardDescription>
                  Access all maintenance-related features
                  {selectedProject && (
                    <span className="block mt-1 text-primary">
                      Filtered by: {selectedProject.title}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    className="h-20 flex-col gap-2"
                    variant="outline"
                    onClick={() => navigate("/maintenance-calendar")}
                  >
                    <Calendar className="h-6 w-6" />
                    Maintenance Calendar
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2"
                    variant="outline"
                    onClick={() => navigate("/task-dashboard")}
                  >
                    <ClipboardList className="h-6 w-6" />
                    Task Dashboard
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2"
                    variant="outline"
                    onClick={() => navigate("/asset-dashboard")}
                  >
                    <BarChart3 className="h-6 w-6" />
                    Asset Dashboard
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2"
                    variant="outline"
                    onClick={() => navigate("/maintenance-tasks")}
                  >
                    <Settings className="h-6 w-6" />
                    Task Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Home;