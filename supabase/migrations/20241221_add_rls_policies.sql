-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update projects" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete projects" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for assets table
CREATE POLICY "Users can view all assets" ON assets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert assets" ON assets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update assets" ON assets
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete assets" ON assets
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for qr_codes table
CREATE POLICY "Users can view all qr_codes" ON qr_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert qr_codes" ON qr_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update qr_codes" ON qr_codes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete qr_codes" ON qr_codes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for maintenance_reports table
CREATE POLICY "Users can view all maintenance_reports" ON maintenance_reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert maintenance_reports" ON maintenance_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update maintenance_reports" ON maintenance_reports
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete maintenance_reports" ON maintenance_reports
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for service_records table
CREATE POLICY "Users can view all service_records" ON service_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert service_records" ON service_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update service_records" ON service_records
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete service_records" ON service_records
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for maintenance_schedules table
CREATE POLICY "Users can view all maintenance_schedules" ON maintenance_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert maintenance_schedules" ON maintenance_schedules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update maintenance_schedules" ON maintenance_schedules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete maintenance_schedules" ON maintenance_schedules
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for maintenance_tasks table
CREATE POLICY "Users can view all maintenance_tasks" ON maintenance_tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert maintenance_tasks" ON maintenance_tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update maintenance_tasks" ON maintenance_tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete maintenance_tasks" ON maintenance_tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for repairs table
CREATE POLICY "Users can view all repairs" ON repairs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert repairs" ON repairs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update repairs" ON repairs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete repairs" ON repairs
  FOR DELETE USING (auth.role() = 'authenticated');