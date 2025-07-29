import React, { useState, useEffect } from "react";
import { Building2, Users, Calendar, MapPin, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { supabase, hasSupabaseCredentials } from "@/lib/supabase";
import { Project, ProjectWithAssets } from "@/types/supabase";
import { useAuth } from "./AuthProvider";

interface ProjectSelectorProps {
  selectedProjectId?: string;
  onProjectSelect?: (project: Project | null) => void;
  showAssetCount?: boolean;
}

const ProjectSelector = ({
  selectedProjectId,
  onProjectSelect = () => {},
  showAssetCount = true,
}: ProjectSelectorProps) => {
  const { user, session } = useAuth();
  const [projects, setProjects] = useState<ProjectWithAssets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && session) {
      fetchProjects();
    }
  }, [user, session]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!hasSupabaseCredentials) {
        console.log("Using mock data - no Supabase credentials");
        setProjects([
          {
            id: "1",
            title: "Downtown Office Complex",
            description: "Modern office building with HVAC and security systems",
            location: "Downtown District",
            status: "active",
            user_id: "demo-user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Residential Tower A",
            description: "High-rise residential building with elevators and fire safety",
            location: "North Side",
            status: "active",
            user_id: "demo-user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "3",
            title: "Industrial Facility B",
            description: "Manufacturing facility with specialized equipment",
            location: "Industrial Park",
            status: "active",
            user_id: "demo-user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      if (!user || !session) {
        console.log("User not authenticated, waiting...");
        setLoading(false);
        return;
      }

      console.log("Fetching projects from database...");
      console.log("User ID:", user.id);
      console.log("Session valid:", !!session.access_token);

      // First, get all projects for the current user
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("title");

      if (projectsError) {
        console.error("Projects fetch error:", projectsError);
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }

      console.log("Successfully fetched projects:", projectsData?.length || 0);

      // Get asset counts for each project through annotations
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          // Get annotations for this project
          const { data: annotations, error: annotationsError } = await supabase
            .from("annotations")
            .select("id")
            .eq("project_id", project.id);

          if (annotationsError) {
            console.warn(`Error fetching annotations for project ${project.id}:`, annotationsError);
            return {
              ...project,
              name: project.title,
              asset_count: 0,
              client_name: project.description,
              project_type: "General",
              project_manager: "TBD",
            };
          }

          // Get assets associated with these annotations
          let assetCount = 0;
          if (annotations && annotations.length > 0) {
            const annotationIds = annotations.map(a => a.id);
            const { count, error: countError } = await supabase
              .from("assets")
              .select("*", { count: "exact", head: true })
              .in("annotation_id", annotationIds);

            if (!countError) {
              assetCount = count || 0;
            }
          }

          return {
            ...project,
            name: project.title, // Map title to name for compatibility
            asset_count: assetCount,
            client_name: project.description,
            project_type: "General",
            project_manager: "TBD",
          };
        })
      );

      setProjects(projectsWithCounts);
      console.log("Projects loaded successfully:", projectsWithCounts.length);
    } catch (err) {
      console.error("Error in fetchProjects:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch projects";
      setError(errorMessage);

      // Fallback to mock data on error
      console.log("Falling back to mock data due to error");
      setProjects([
        {
          id: "1",
          name: "Downtown Office Complex (Demo)",
          description: "Modern office building with HVAC and security systems",
          client_name: "ABC Corporation",
          project_type: "Commercial",
          status: "active",
          location: "Downtown District",
          project_manager: "John Smith",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          start_date: null,
          end_date: null,
          asset_count: 15,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "on_hold":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    onProjectSelect(project || null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              Loading projects...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-background w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Select Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a project..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{project.name}</span>
                    {showAssetCount && (
                      <Badge variant="outline" className="ml-2">
                        {project.asset_count} assets
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project Cards */}
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProjectId === project.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleProjectSelect(project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{project.name}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {project.client_name && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Client:</span>
                        <span>{project.client_name}</span>
                      </div>
                    )}

                    {project.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                        <span>{project.location}</span>
                      </div>
                    )}

                    {project.project_manager && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Manager:</span>
                        <span>{project.project_manager}</span>
                      </div>
                    )}

                    {showAssetCount && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Assets:</span>
                        <span>{project.asset_count}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSelector;