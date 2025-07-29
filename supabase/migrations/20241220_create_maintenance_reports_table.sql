-- Create maintenance reports table
CREATE TABLE maintenance_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_id TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'hvac_checklist' CHECK (report_type IN ('hvac_checklist', 'custom_tasks', 'combined')),
  hvac_unit_type TEXT,
  hvac_checklist_data JSONB,
  custom_tasks_data JSONB,
  general_notes TEXT,
  technician_name TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to assets
ALTER TABLE maintenance_reports 
ADD CONSTRAINT fk_maintenance_reports_asset 
FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_maintenance_reports_asset_id ON maintenance_reports(asset_id);
CREATE INDEX idx_maintenance_reports_submitted_at ON maintenance_reports(submitted_at);
CREATE INDEX idx_maintenance_reports_type ON maintenance_reports(report_type);

-- Create updated_at trigger
CREATE TRIGGER update_maintenance_reports_updated_at
  BEFORE UPDATE ON maintenance_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();