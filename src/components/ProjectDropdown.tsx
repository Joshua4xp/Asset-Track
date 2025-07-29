import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
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

interface ProjectDropdownProps {
  selectedProjectId?: string;
  onProjectSelect?: (project: Project | null) => void;
}

const ProjectDropdown = ({
  selectedProjectId,
  onProjectSelect = () => {},
}: ProjectDropdownProps) => {
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

      if (!user || !session) {
        console.log("User not authenticated, waiting...");
        setLoading(false);
        return;
      }

      console.log("Fetching projects from database...");

      // First, get all projects for the current user
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("title");

      if (projectsError) {
        console.error("Projects fetch error:", projectsError);
        // If there's an error, use mock data as fallback
        console.log("Using mock data due to database error");
        setProjects([
          {
            id: "1",
            title: "Downtown Office Complex",
            description:
              "Modern office building with HVAC and security systems",
            location: "Downtown District",
            status: "active",
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            asset_count: 15,
          },
          {
            id: "2",
            title: "Residential Tower A",
            description:
              "High-rise residential building with elevators and fire safety",
            location: "North Side",
            status: "active",
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            asset_count: 8,
          },
          {
            id: "3",
            title: "Industrial Facility B",
            description: "Manufacturing facility with specialized equipment",
            location: "Industrial Park",
            status: "active",
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            asset_count: 22,
          },
        ]);
        setLoading(false);
        return;
      }

      console.log("Successfully fetched projects:", projectsData?.length || 0);

      // Get asset counts for each project through annotations
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          // First get annotations for this project
          const { data: annotations, error: annotationsError } = await supabase
            .from("annotations")
            .select("id")
            .eq("project_id", project.id);

          if (annotationsError) {
            console.warn(
              `Error fetching annotations for project ${project.id}:`,
              annotationsError,
            );
            return {
              ...project,
              asset_count: 0,
            };
          }

          // Then count assets that have these annotation_ids
          let assetCount = 0;
          if (annotations && annotations.length > 0) {
            const annotationIds = annotations.map((ann) => ann.id);
            const { count, error: countError } = await supabase
              .from("assets")
              .select("*", { count: "exact", head: true })
              .in("annotation_id", annotationIds);

            if (countError) {
              console.warn(
                `Error counting assets for project ${project.id}:`,
                countError,
              );
            } else {
              assetCount = count || 0;
            }
          }

          return {
            ...project,
            asset_count: assetCount,
          };
        }),
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
          title: "Downtown Office Complex (Demo)",
          description: "Modern office building with HVAC and security systems",
          status: "active",
          location: "Downtown District",
          user_id: user?.id || "demo-user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          asset_count: 15,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (value: string) => {
    if (value === "portfolio") {
      onProjectSelect(null); // Portfolio overview shows all projects
    } else {
      const project = projects.find((p) => p.id === value);
      onProjectSelect(project || null);
    }
  };

  const getTotalAssets = () => {
    return projects.reduce(
      (total, project) => total + (project.asset_count || 0),
      0,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Loading projects...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">Error loading projects</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Building2 className="h-5 w-5 text-primary" />
      <Select
        value={selectedProjectId || "portfolio"}
        onValueChange={handleProjectSelect}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select project..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="portfolio">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">Portfolio Overview</span>
              <Badge variant="outline" className="ml-2">
                {getTotalAssets()} assets
              </Badge>
            </div>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center justify-between w-full">
                <span>{project.title}</span>
                <Badge variant="outline" className="ml-2">
                  {project.asset_count || 0} assets
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectDropdown;
