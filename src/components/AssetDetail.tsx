import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Settings,
  Wrench,
  FileText,
  Package,
  QrCode,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { supabase } from "@/lib/supabase";
import {
  Asset,
  Project,
  ServiceRecord,
  MaintenanceTask,
  Repair,
  AssetFile,
} from "@/types/supabase";

interface AssetDetailProps {
  id?: string;
  asset?: AssetWithRelations;
  onBack?: () => void;
}

interface AssetWithRelations extends Asset {
  project?: Project;
  asset_type?: any; // Add asset type data
  service_records?: ServiceRecord[];
  maintenance_tasks?: MaintenanceTask[];
  repairs?: Repair[];
  asset_files?: AssetFile[];
}

export default function AssetDetail({ id, asset, onBack }: AssetDetailProps) {
  const params = useParams();
  const navigate = useNavigate();
  const [assetData, setAssetData] = useState<AssetWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get asset ID from props or URL params
  const assetId = id || params.id;

  useEffect(() => {
    if (asset) {
      setAssetData(asset);
      setLoading(false);
    } else if (assetId) {
      fetchAssetData(assetId);
    } else {
      setError("No asset ID provided");
      setLoading(false);
    }
  }, [assetId, asset]);

  const fetchAssetData = async (assetId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching asset data for ID:", assetId);

      // First, try to get asset by QR code
      const { data: qrData, error: qrError } = await supabase
        .from("qr_codes")
        .select("assigned_asset_id")
        .eq("id", assetId)
        .single();

      console.log("QR lookup result:", { qrData, qrError });

      let actualAssetId = assetId;
      if (qrData?.assigned_asset_id) {
        actualAssetId = qrData.assigned_asset_id;
        console.log("Using assigned asset ID:", actualAssetId);
      } else {
        console.log(
          "No QR assignment found, trying direct asset lookup with ID:",
          assetId,
        );
      }

      // Fetch asset data first
      const { data: assetData, error: assetError } = await supabase
        .from("assets")
        .select("*")
        .eq("id", actualAssetId)
        .single();

      console.log("Asset fetch result:", { assetData, assetError });

      if (assetError) {
        console.error("Asset fetch error:", assetError);
        setError("Error fetching asset data: " + assetError.message);
        return;
      }

      console.log("Successfully fetched asset:", assetData);

      // Get asset type information from default_asset_types table, with fallback to user_asset_types
      let assetTypeData = null;
      if (assetData.asset_type_id) {
        // First try default_asset_types
        const { data: defaultTypeData, error: defaultTypeError } =
          await supabase
            .from("default_asset_types")
            .select("*")
            .eq("id", assetData.asset_type_id)
            .single();

        if (!defaultTypeError && defaultTypeData) {
          assetTypeData = defaultTypeData;
          console.log(
            "Asset type data from default_asset_types:",
            assetTypeData,
          );
        } else {
          // Fallback to user_asset_types if not found in default or if cost data is missing
          console.log("Falling back to user_asset_types table");
          const { data: userTypeData, error: userTypeError } = await supabase
            .from("user_asset_types")
            .select("*")
            .eq("id", assetData.asset_type_id)
            .single();

          if (!userTypeError && userTypeData) {
            assetTypeData = userTypeData;
            console.log(
              "Asset type data from user_asset_types:",
              assetTypeData,
            );
          } else {
            console.log("Asset type not found in either table");
          }
        }
      }

      // Get project information through annotations if asset has annotation_id
      let projectData = null;
      if (assetData.annotation_id) {
        const { data: annotationData, error: annotationError } = await supabase
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
              status,
              created_at,
              updated_at
            )
          `,
          )
          .eq("id", assetData.annotation_id)
          .single();

        if (!annotationError && annotationData?.projects) {
          projectData = {
            ...annotationData.projects,
            name: annotationData.projects.title, // Map title to name for compatibility
          };
        }
      }

      // Fetch related data separately
      const [serviceRecords, maintenanceTasks, repairs, assetFiles] =
        await Promise.all([
          supabase
            .from("service_records")
            .select("*")
            .eq("asset_id", actualAssetId),
          supabase
            .from("maintenance_tasks")
            .select("*")
            .eq("asset_id", actualAssetId),
          supabase.from("repairs").select("*").eq("asset_id", actualAssetId),
          supabase
            .from("asset_files")
            .select("*")
            .eq("asset_id", actualAssetId),
        ]);

      console.log("Related data:", {
        serviceRecords: serviceRecords.data?.length || 0,
        maintenanceTasks: maintenanceTasks.data?.length || 0,
        repairs: repairs.data?.length || 0,
        assetFiles: assetFiles.data?.length || 0,
      });

      // Combine all data
      const combinedAssetData: AssetWithRelations = {
        ...assetData,
        project: projectData,
        asset_type: assetTypeData, // Add asset type data
        service_records: serviceRecords.data || [],
        maintenance_tasks: maintenanceTasks.data || [],
        repairs: repairs.data || [],
        asset_files: assetFiles.data || [],
      };

      setAssetData(combinedAssetData);
    } catch (err) {
      console.error("Error fetching asset:", err);
      setError("Failed to fetch asset data: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate to current assets page with project filter if asset has a project
      if (assetData?.project?.id) {
        navigate("/", {
          state: {
            selectedProjectId: assetData.project.id,
            activeTab: "assets",
          },
        });
      } else {
        navigate("/", { state: { activeTab: "assets" } });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "good":
      case "operational":
        return "bg-green-100 text-green-800";
      case "fair":
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Asset
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBack}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!assetData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Asset not found</p>
          <Button onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {assetData.name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <span className="text-sm">Asset ID: {assetData.id}</span>
              {assetData.project && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm">{assetData.project.title}</span>
                </>
              )}
              {assetData.description && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm">{assetData.description}</span>
                </>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleBack}>
            ← Back
          </Button>
        </div>

        {/* Asset Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Asset Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Quantity
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {assetData.quantity || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Year Installed
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {assetData.year_installed || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Current Age
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {assetData.year_installed
                        ? `${new Date().getFullYear() - assetData.year_installed} years`
                        : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Expected Life
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {assetData.asset_type?.expected_life
                        ? `${assetData.asset_type.expected_life} years`
                        : "15 years"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Replacement Year
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {assetData.year_installed &&
                      assetData.asset_type?.expected_life
                        ? assetData.year_installed +
                          assetData.asset_type.expected_life
                        : assetData.year_installed
                          ? assetData.year_installed + 15
                          : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Years Until Replacement
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {assetData.year_installed &&
                      assetData.asset_type?.expected_life
                        ? Math.max(
                            0,
                            assetData.year_installed +
                              assetData.asset_type.expected_life -
                              new Date().getFullYear(),
                          ) + " years"
                        : assetData.year_installed
                          ? Math.max(
                              0,
                              assetData.year_installed +
                                15 -
                                new Date().getFullYear(),
                            ) + " years"
                          : "Not specified"}
                    </p>
                  </div>
                </div>

                {assetData.notes && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500">
                      Notes
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {assetData.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">$</span>
                  Cost Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Low Cost Estimate
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {assetData.asset_type?.low_cost_estimate
                        ? `$${assetData.asset_type.low_cost_estimate.toLocaleString()}`
                        : "Not available"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      High Cost Estimate
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {assetData.asset_type?.high_cost_estimate
                        ? `$${assetData.asset_type.high_cost_estimate.toLocaleString()}`
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500">
                    Total Replacement Cost
                  </label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {assetData.asset_type?.high_cost_estimate &&
                    assetData.quantity
                      ? `$${(assetData.asset_type.high_cost_estimate * assetData.quantity).toLocaleString()}`
                      : assetData.asset_type?.high_cost_estimate
                        ? `$${assetData.asset_type.high_cost_estimate.toLocaleString()}`
                        : "Not available"}
                  </p>
                </div>

                {assetData.asset_type?.replacement_description && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500">
                      Replacement Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {assetData.asset_type.replacement_description}
                    </p>
                  </div>
                )}

                {assetData.asset_type?.cost_description && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">
                      Cost Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {assetData.asset_type.cost_description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Asset Status & Location */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Asset Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Lifespan Remaining
                    </label>
                    <div className="mt-2">
                      {assetData.year_installed && (
                        <>
                          {(() => {
                            const expectedLife =
                              assetData.asset_type?.expected_life || 15;
                            const yearsLeft = Math.max(
                              0,
                              assetData.year_installed +
                                expectedLife -
                                new Date().getFullYear(),
                            );
                            const percentageLeft = Math.max(
                              0,
                              Math.min(100, (yearsLeft / expectedLife) * 100),
                            );

                            return (
                              <>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{Math.round(percentageLeft)}%</span>
                                  <span>{yearsLeft} years left</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      percentageLeft > 50
                                        ? "bg-green-500"
                                        : percentageLeft > 25
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{ width: `${percentageLeft}%` }}
                                  ></div>
                                </div>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <Badge
                      className={getStatusColor(
                        assetData.condition || "unknown",
                      )}
                    >
                      {assetData.condition || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assetData.project?.location && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      {assetData.project.location}
                    </p>
                  </div>
                )}

                {assetData.line_position && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">
                      Line Path:
                    </label>
                    <div className="mt-1 text-xs text-gray-600 space-y-1">
                      {Array.isArray(assetData.line_position) &&
                        assetData.line_position.map(
                          (point: any, index: number) => (
                            <div key={index}>
                              Point {index + 1}: X: {point.x?.toFixed(2)}, Y:{" "}
                              {point.y?.toFixed(2)}, Z: {point.z?.toFixed(2)}
                            </div>
                          ),
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="maintenance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="service">Service History</TabsTrigger>
            <TabsTrigger value="repairs">Repairs</TabsTrigger>
            <TabsTrigger value="files">Asset Files</TabsTrigger>
          </TabsList>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Tasks
                </CardTitle>
                <CardDescription>
                  Scheduled and completed maintenance activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetData.maintenance_tasks &&
                assetData.maintenance_tasks.length > 0 ? (
                  <div className="space-y-4">
                    {assetData.maintenance_tasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge
                            className={
                              task.completed
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {task.completed ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No maintenance tasks found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service History Tab */}
          <TabsContent value="service">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Service History
                </CardTitle>
                <CardDescription>
                  Record of all service activities and maintenance logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetData.service_records &&
                assetData.service_records.length > 0 ? (
                  <div className="space-y-4">
                    {assetData.service_records.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{record.service_type}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(record.service_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {record.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Technician:{" "}
                          {record.technician_name || "Not specified"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No service records found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Repairs Tab */}
          <TabsContent value="repairs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Repairs
                </CardTitle>
                <CardDescription>
                  Repair history and current repair status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetData.repairs && assetData.repairs.length > 0 ? (
                  <div className="space-y-4">
                    {assetData.repairs.map((repair) => (
                      <div key={repair.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{repair.repair_type}</h4>
                          <Badge
                            className={
                              repair.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {repair.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {repair.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Started:{" "}
                          {new Date(repair.start_date).toLocaleDateString()}
                          {repair.completion_date && (
                            <span>
                              {" "}
                              • Completed:{" "}
                              {new Date(
                                repair.completion_date,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No repairs found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Asset Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Asset Files
                </CardTitle>
                <CardDescription>
                  Documents, manuals, and files related to this asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetData.asset_files && assetData.asset_files.length > 0 ? (
                  <div className="space-y-4">
                    {assetData.asset_files.map((file) => (
                      <div
                        key={file.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {file.name}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>Type: {file.type}</span>
                              <span>
                                Size: {(file.size / 1024).toFixed(1)} KB
                              </span>
                              <span>
                                Uploaded:{" "}
                                {new Date(
                                  file.uploaded_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, "_blank")}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No files found for this asset
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
