export interface QRCode {
  id: string;
  assigned_asset_id: string | null;
  status: 'unassigned' | 'assigned';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  asset_count?: number;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  asset_type_id: string | null;
  is_custom_type: boolean | null;
  quantity: number | null;
  year_installed: number | null;
  notes: string | null;
  position: any | null;
  annotation_id: string | null;
  measurement_id: string | null;
  created_at: string;
  updated_at: string;
  condition: string | null;
  description: string | null;
  replacement_description: string | null;
  cost_description: string | null;
  is_linear: boolean | null;
  line_thickness: number | null;
  line_color: string | null;
  line_position: any | null;
}

export interface AssetFile {
  id: string;
  asset_id: string;
  user_id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file_path: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRecord {
  id: string;
  asset_id: string;
  project_id: string | null;
  service_type: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'calibration';
  service_date: string;
  technician_name: string;
  technician_company: string | null;
  service_description: string;
  parts_used: any | null;
  labor_hours: number | null;
  service_cost: number | null;
  next_service_date: string | null;
  service_notes: string | null;
  photos: any | null;
  documents: any | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  asset_id: string;
  project_id: string | null;
  schedule_name: string;
  maintenance_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'custom';
  frequency_days: number | null;
  last_performed: string | null;
  next_due_date: string;
  assigned_technician: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration: number | null;
  maintenance_checklist: any | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTask {
  id: string;
  asset_id: string;
  project_id: string | null;
  schedule_id: string | null;
  task_title: string;
  task_description: string | null;
  task_type: 'preventive' | 'corrective' | 'inspection' | 'emergency' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assigned_to: string | null;
  assigned_date: string | null;
  due_date: string;
  completed_date: string | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  completion_notes: string | null;
  photos: any | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Repair {
  id: string;
  asset_id: string;
  project_id: string | null;
  repair_title: string;
  repair_description: string;
  failure_type: 'mechanical' | 'electrical' | 'software' | 'structural' | 'other' | null;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'assigned' | 'in_progress' | 'parts_ordered' | 'completed' | 'cancelled';
  reported_by: string;
  reported_date: string;
  assigned_to: string | null;
  assigned_date: string | null;
  started_date: string | null;
  completed_date: string | null;
  repair_cost: number | null;
  parts_cost: number | null;
  labor_cost: number | null;
  downtime_hours: number | null;
  repair_notes: string | null;
  parts_used: any | null;
  photos_before: any | null;
  photos_after: any | null;
  documents: any | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceReport {
  id: string;
  asset_id: string;
  report_type: 'hvac_checklist' | 'custom_tasks' | 'combined';
  hvac_unit_type: string | null;
  hvac_checklist_data: any | null;
  custom_tasks_data: any | null;
  general_notes: string | null;
  technician_name: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface Annotation {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetWithAnnotation extends Asset {
  annotation?: Annotation;
  project?: Project;
}

export interface AnnotationWithAssets extends Annotation {
  assets?: Asset[];
  project?: Project;
}

export interface AssetWithRelations extends Asset {
  project?: Project;
  service_records?: ServiceRecord[];
  maintenance_schedules?: MaintenanceSchedule[];
  maintenance_tasks?: MaintenanceTask[];
  repairs?: Repair[];
  qr_codes?: QRCode[];
}

export interface ProjectWithAssets extends Project {
  assets?: Asset[];
  asset_count?: number;
}

export interface MaintenanceTaskWithAsset extends MaintenanceTask {
  asset?: Asset;
  project?: Project;
}

export interface ServiceRecordWithAsset extends ServiceRecord {
  asset?: Asset;
  project?: Project;
}

export interface RepairWithAsset extends Repair {
  asset?: Asset;
  project?: Project;
}