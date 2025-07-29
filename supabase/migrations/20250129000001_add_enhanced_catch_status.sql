-- Add enhanced catch status and location status columns to catch_records table

-- Add catch_status column
ALTER TABLE catch_records 
ADD COLUMN catch_status TEXT;

-- Add location_status column
ALTER TABLE catch_records 
ADD COLUMN location_status TEXT;

-- Add check constraints to ensure valid values
ALTER TABLE catch_records 
ADD CONSTRAINT catch_status_check 
CHECK (catch_status IN ('not_caught', 'caught', 'ready_to_evolve') OR catch_status IS NULL);

ALTER TABLE catch_records 
ADD CONSTRAINT location_status_check 
CHECK (location_status IN ('none', 'in_game', 'in_home') OR location_status IS NULL);

-- Create indexes for better query performance
CREATE INDEX idx_catch_records_catch_status ON catch_records(catch_status);
CREATE INDEX idx_catch_records_location_status ON catch_records(location_status);

-- Comment on the new columns
COMMENT ON COLUMN catch_records.catch_status IS 'Enhanced catch status: not_caught, caught, or ready_to_evolve';
COMMENT ON COLUMN catch_records.location_status IS 'Location tracking: none, in_game, or in_home';