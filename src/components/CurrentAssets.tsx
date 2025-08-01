import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Calendar,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { supabase, hasSupabaseCredentials } from "@/lib/supabase";
import { AssetWithProject, Project } from "@/types/supabase";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";

interface CurrentAssetsProps {
  selectedProjectId?: string;
  onAssetSelect?: (asset: AssetWithProject) => void;
}

const CurrentAssets = ({
  selectedProjectId,
  onAssetSelect = () => {},
}: CurrentAssetsProps) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<AssetWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (user && session) {
      fetchAssets();
      fetchProjects();
    }
  }, [selectedProjectId, user, session]);

  const fetchProjects = async () => {
    if (!user || !session) {
      console.log("User not authenticated for projects in CurrentAssets");
      return;
    }

    try {
      console.log("Fetching projects for user:", user.id);
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, description, location, status, client_name, project_type, project_manager, created_at, updated_at",
        )
        .order("name");

      if (error) {
        console.error("Projects fetch error in CurrentAssets:", error);
        setProjects([]);
        return;
      }

      // Transform projects to include title field for backward compatibility
      const transformedProjects = (data || []).map((project) => ({
        ...project,
        title: project.name, // Map name to title for backward compatibility
        user_id: user.id, // Add user_id for compatibility
      }));

      console.log(
        "Projects fetched in CurrentAssets:",
        transformedProjects.length,
      );
      setProjects(transformedProjects);
    } catch (err) {
      console.error("Error fetching projects in CurrentAssets:", err);
      setProjects([]);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !session) {
        console.log("User not authenticated for assets, waiting...");
        setLoading(false);
        return;
      }

      console.log("Fetching assets from database...");
      console.log("Selected project ID:", selectedProjectId);

      let assetsData = [];

      if (selectedProjectId && selectedProjectId !== "all") {
        // Filter by project: get annotations for the project first, then get assets
        const { data: annotations, error: annotationsError } = await supabase
          .from("annotations")
          .select("id")
          .eq("project_id", selectedProjectId);

        if (annotationsError) {
          console.error("Annotations fetch error:", annotationsError);
          throw new Error(
            `Failed to fetch annotations: ${annotationsError.message}`,
          );
        }

        if (annotations && annotations.length > 0) {
          const annotationIds = annotations.map((a) => a.id);

          const { data: assets, error: assetsError } = await supabase
            .from("assets")
            .select("*")
            .eq("user_id", user.id)
            .in("annotation_id", annotationIds)
            .order("name");

          if (assetsError) {
            console.error("Assets fetch error:", assetsError);
            throw new Error(`Failed to fetch assets: ${assetsError.message}`);
          }

          assetsData = assets || [];
        }
      } else {
        // Get all assets for the user
        const { data: assets, error: assetsError } = await supabase
          .from("assets")
          .select("*")
          .eq("user_id", user.id)
          .order("name");

        if (assetsError) {
          console.error("Assets fetch error:", assetsError);
          throw new Error(`Failed to fetch assets: ${assetsError.message}`);
        }

        assetsData = assets || [];
      }

      // Get project information for assets that have annotation_id
      const annotationIds = [
        ...new Set(
          assetsData.map((asset) => asset.annotation_id).filter(Boolean),
        ),
      ];
      let projectsMap = {};

      if (annotationIds.length > 0) {
        const { data: annotations, error: annotationsError } = await supabase
          .from("annotations")
          .select(
            `
            id,
            project_id,
            projects (
              id,
              title,
              description,
              location,
              status
            )
          `,
          )
          .in("id", annotationIds);

        if (!annotationsError && annotations) {
          // Create a map from annotation_id to project
          annotations.forEach((annotation) => {
            if (annotation.projects) {
              projectsMap[annotation.id] = {
                ...annotation.projects,
                name: annotation.projects.title, // Map title to name for compatibility
              };
            }
          });
        }
      }

      // Transform the data to match expected format
      const transformedAssets = assetsData.map((asset) => ({
        ...asset,
        type: asset.asset_type_id ? "Custom Type" : "Standard",
        model: "N/A",
        serial_number: "N/A",
        location: projectsMap[asset.annotation_id]?.location || "Unknown",
        status: asset.condition || "operational",
        install_date: asset.year_installed
          ? `${asset.year_installed}-01-01`
          : null,
        warranty_expiry: null,
        purchase_date: null,
        purchase_cost: null,
        project:
          asset.annotation_id && projectsMap[asset.annotation_id]
            ? {
                ...projectsMap[asset.annotation_id],
                title: projectsMap[asset.annotation_id].name,
              }
            : null,
      }));

      console.log("Successfully fetched assets:", transformedAssets.length);
      setAssets(transformedAssets);
    } catch (err) {
      console.error("Error in fetchAssets:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch assets";
      setError(errorMessage);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetClick = (asset: AssetWithProject) => {
    console.log("Asset clicked:", asset.id);
    // Navigate to asset detail page with the asset ID
    navigate(`/asset/${asset.id}`);
    // Also call the onAssetSelect callback if provided
    onAssetSelect(asset);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600 bg-green-100";
      case "maintenance":
        return "text-yellow-600 bg-yellow-100";
      case "offline":
        return "text-red-600 bg-red-100";
      case "decommissioned":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || asset.type === filterType;
    const matchesStatus =
      filterStatus === "all" || asset.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const assetTypes = [
    ...new Set(assets.map((asset) => asset.type).filter(Boolean)),
  ];
  const assetStatuses = [...new Set(assets.map((asset) => asset.status))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              Loading assets...
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
    <div className="bg-background w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Building2 className="mr-2 h-6 w-6" />
          Current Assets
        </h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Export
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
                <p className="text-sm text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold text-green-600">
                  {assets.filter((a) => a.status === "operational").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {assets.filter((a) => a.status === "maintenance").length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {assets.filter((a) => a.criticality === "critical").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Asset Inventory</CardTitle>
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
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {assetStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => handleAssetClick(asset)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {asset.project?.title || "No Project"} • {asset.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={getStatusColor(asset.condition || asset.status)}
                  >
                    {asset.condition || asset.status}
                  </Badge>
                </div>
              </div>
            ))}

            {filteredAssets.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No assets found matching your criteria
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrentAssets;
