-- Add assignments table for tracking scheduled work
CREATE TABLE public.assignments (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR REFERENCES employees(employee_id),
  product_code VARCHAR REFERENCES products(product_code),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add resources table for equipment/machines
CREATE TABLE public.resources (
  id SERIAL PRIMARY KEY,
  resource_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  capacity INTEGER DEFAULT 1,
  status VARCHAR DEFAULT 'available',
  maintenance_schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add constraints table for AI-defined scheduling rules
CREATE TABLE public.constraints (
  id SERIAL PRIMARY KEY,
  constraint_type VARCHAR NOT NULL,
  description TEXT NOT NULL,
  parameters JSONB,
  priority INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constraints ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all operations on assignments" 
ON public.assignments FOR ALL USING (true);

CREATE POLICY "Allow all operations on resources" 
ON public.resources FOR ALL USING (true);

CREATE POLICY "Allow all operations on constraints" 
ON public.constraints FOR ALL USING (true);

-- Add trigger for updated_at on assignments
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true);

-- Create storage policies for file uploads
CREATE POLICY "Allow public uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow public downloads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');