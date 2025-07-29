-- First, let's check if assets table exists and what type the id column is
-- If it exists with UUID, we'll work with that

-- Improved random string generation function
CREATE OR REPLACE FUNCTION generate_random_string(length INTEGER)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars)) + 1, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create assets table if it doesn't exist (keeping UUID if it already exists)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  model TEXT,
  serial_number TEXT,
  location TEXT,
  status TEXT DEFAULT 'operational',
  install_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create QR codes table with UUID type to match assets table
CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY DEFAULT generate_random_string(8),
  assigned_asset_id UUID, -- Changed to UUID to match assets.id
  status TEXT NOT NULL DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'assigned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id)
);

-- Add foreign key constraint with matching UUID types
ALTER TABLE qr_codes 
ADD CONSTRAINT fk_qr_codes_asset 
FOREIGN KEY (assigned_asset_id) REFERENCES assets(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_asset_id ON qr_codes(assigned_asset_id);

-- Updated_at trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_qr_codes_updated_at ON qr_codes;
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;

-- Create triggers
CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();