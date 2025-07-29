-- Create projects table for Portfolio-Elevation integration
CREATE TABLE projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  project_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  start_date DATE,
  end_date DATE,
  location TEXT,
  project_manager TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add project_id to existing assets table (non-breaking change)
ALTER TABLE assets 
ADD COLUMN project_id TEXT,
ADD COLUMN description TEXT,
ADD COLUMN manufacturer TEXT,
ADD COLUMN warranty_expiry DATE,
ADD COLUMN purchase_date DATE,
ADD COLUMN purchase_cost DECIMAL(10,2),
ADD COLUMN criticality TEXT DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical'));

-- Add foreign key constraint for project association
ALTER TABLE assets 
ADD CONSTRAINT fk_assets_project 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Create service records table
CREATE TABLE service_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_id TEXT NOT NULL,
  project_id TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('preventive', 'corrective', 'emergency', 'inspection', 'calibration')),
  service_date DATE NOT NULL,
  technician_name TEXT NOT NULL,
  technician_company TEXT,
  service_description TEXT NOT NULL,
  parts_used JSONB,
  labor_hours DECIMAL(4,2),
  service_cost DECIMAL(10,2),
  next_service_date DATE,
  service_notes TEXT,
  photos JSONB,
  documents JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance schedules table
CREATE TABLE maintenance_schedules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_id TEXT NOT NULL,
  project_id TEXT,
  schedule_name TEXT NOT NULL,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'custom')),
  frequency_days INTEGER,
  last_performed DATE,
  next_due_date DATE NOT NULL,
  assigned_technician TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_duration INTEGER, -- in minutes
  maintenance_checklist JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance tasks table
CREATE TABLE maintenance_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_id TEXT NOT NULL,
  project_id TEXT,
  schedule_id TEXT,
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('preventive', 'corrective', 'inspection', 'emergency', 'custom')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'overdue')),
  assigned_to TEXT,
  assigned_date DATE,
  due_date DATE NOT NULL,
  completed_date DATE,
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER, -- in minutes
  completion_notes TEXT,
  photos JSONB,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repairs table
CREATE TABLE repairs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_id TEXT NOT NULL,
  project_id TEXT,
  repair_title TEXT NOT NULL,
  repair_description TEXT NOT NULL,
  failure_type TEXT CHECK (failure_type IN ('mechanical', 'electrical', 'software', 'structural', 'other')),
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'assigned', 'in_progress', 'parts_ordered', 'completed', 'cancelled')),
  reported_by TEXT NOT NULL,
  reported_date DATE NOT NULL,
  assigned_to TEXT,
  assigned_date DATE,
  started_date DATE,
  completed_date DATE,
  repair_cost DECIMAL(10,2),
  parts_cost DECIMAL(10,2),
  labor_cost DECIMAL(10,2),
  downtime_hours DECIMAL(6,2),
  repair_notes TEXT,
  parts_used JSONB,
  photos_before JSONB,
  photos_after JSONB,
  documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE service_records 
ADD CONSTRAINT fk_service_records_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_service_records_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE maintenance_schedules 
ADD CONSTRAINT fk_maintenance_schedules_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_maintenance_schedules_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE maintenance_tasks 
ADD CONSTRAINT fk_maintenance_tasks_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_maintenance_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_maintenance_tasks_schedule FOREIGN KEY (schedule_id) REFERENCES maintenance_schedules(id) ON DELETE SET NULL;

ALTER TABLE repairs 
ADD CONSTRAINT fk_repairs_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_repairs_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client_name);

CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_type ON assets(type);

CREATE INDEX idx_service_records_asset_id ON service_records(asset_id);
CREATE INDEX idx_service_records_project_id ON service_records(project_id);
CREATE INDEX idx_service_records_date ON service_records(service_date);
CREATE INDEX idx_service_records_type ON service_records(service_type);

CREATE INDEX idx_maintenance_schedules_asset_id ON maintenance_schedules(asset_id);
CREATE INDEX idx_maintenance_schedules_project_id ON maintenance_schedules(project_id);
CREATE INDEX idx_maintenance_schedules_due_date ON maintenance_schedules(next_due_date);
CREATE INDEX idx_maintenance_schedules_active ON maintenance_schedules(is_active);

CREATE INDEX idx_maintenance_tasks_asset_id ON maintenance_tasks(asset_id);
CREATE INDEX idx_maintenance_tasks_project_id ON maintenance_tasks(project_id);
CREATE INDEX idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX idx_maintenance_tasks_due_date ON maintenance_tasks(due_date);
CREATE INDEX idx_maintenance_tasks_assigned ON maintenance_tasks(assigned_to);

CREATE INDEX idx_repairs_asset_id ON repairs(asset_id);
CREATE INDEX idx_repairs_project_id ON repairs(project_id);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_urgency ON repairs(urgency);
CREATE INDEX idx_repairs_reported_date ON repairs(reported_date);

-- Create triggers for updated_at columns
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_records_updated_at
  BEFORE UPDATE ON service_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_schedules_updated_at
  BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tasks_updated_at
  BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at
  BEFORE UPDATE ON repairs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample projects (compatible with Portfolio-Elevation)
INSERT INTO projects (name, description, client_name, project_type, status, location, project_manager) VALUES
('Downtown Office Complex', 'Modern office building with HVAC and security systems', 'ABC Corporation', 'Commercial', 'active', 'Downtown District', 'John Smith'),
('Residential Tower A', 'High-rise residential building with elevators and fire safety', 'XYZ Development', 'Residential', 'active', 'North Side', 'Sarah Johnson'),
('Industrial Facility B', 'Manufacturing facility with specialized equipment', 'Industrial Corp', 'Industrial', 'active', 'Industrial Park', 'Mike Wilson');

-- Insert sample assets linked to projects
INSERT INTO assets (name, type, model, serial_number, location, status, project_id, description, manufacturer) VALUES
('HVAC Unit A1', 'HVAC System', 'Model-2023', 'HV001', 'Building A - Roof', 'operational', 
 (SELECT id FROM projects WHERE name = 'Downtown Office Complex'), 
 'Main HVAC unit for floors 1-5', 'HVAC Corp'),
('Generator B2', 'Generator', 'Gen-5000', 'GEN002', 'Building B - Basement', 'operational',
 (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
 'Backup power generator', 'Power Systems Inc'),
('Elevator C1', 'Elevator', 'Lift-Pro', 'ELV003', 'Building C - Main', 'maintenance',
 (SELECT id FROM projects WHERE name = 'Residential Tower A'),
 'Passenger elevator serving floors 1-20', 'Elevator Tech'),
('Fire Panel D1', 'Fire Safety', 'FireGuard-X', 'FP004', 'Building D - Lobby', 'operational',
 (SELECT id FROM projects WHERE name = 'Residential Tower A'),
 'Main fire safety control panel', 'Safety Systems Ltd');

-- Create function to automatically update task status based on due dates
CREATE OR REPLACE FUNCTION update_overdue_tasks()
RETURNS void AS $$
BEGIN
  UPDATE maintenance_tasks 
  SET status = 'overdue' 
  WHERE due_date < CURRENT_DATE 
    AND status IN ('pending', 'assigned');
END;
$$ LANGUAGE plpgsql;

-- Create function to generate next maintenance due dates
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  last_date DATE,
  maintenance_type TEXT,
  frequency_days INTEGER DEFAULT NULL
)
RETURNS DATE AS $$
BEGIN
  CASE maintenance_type
    WHEN 'daily' THEN RETURN last_date + INTERVAL '1 day';
    WHEN 'weekly' THEN RETURN last_date + INTERVAL '1 week';
    WHEN 'monthly' THEN RETURN last_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN RETURN last_date + INTERVAL '3 months';
    WHEN 'semi_annual' THEN RETURN last_date + INTERVAL '6 months';
    WHEN 'annual' THEN RETURN last_date + INTERVAL '1 year';
    WHEN 'custom' THEN 
      IF frequency_days IS NOT NULL THEN
        RETURN last_date + (frequency_days || ' days')::INTERVAL;
      ELSE
        RETURN last_date + INTERVAL '1 month';
      END IF;
    ELSE RETURN last_date + INTERVAL '1 month';
  END CASE;
END;
$$ LANGUAGE plpgsql;