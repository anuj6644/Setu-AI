-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'bridge_operator');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create sensor data table for edge computing data
CREATE TABLE public.sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id TEXT NOT NULL,
  structure_name TEXT NOT NULL,
  vibration_frequency DECIMAL(10,2),
  humidity DECIMAL(5,2),
  strain_measurement DECIMAL(10,4),
  temperature DECIMAL(5,2),
  status TEXT CHECK (status IN ('healthy', 'warning', 'critical')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8)
);

-- Enable RLS on sensor data
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  );
  
  -- Assign default role as bridge_operator
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'bridge_operator');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for sensor_data
CREATE POLICY "Authenticated users can view sensor data"
  ON public.sensor_data FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'bridge_operator')
  );

CREATE POLICY "Admins can manage sensor data"
  ON public.sensor_data FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample sensor data
INSERT INTO public.sensor_data (
  structure_id, structure_name, vibration_frequency, humidity, strain_measurement, 
  temperature, status, latitude, longitude, timestamp
) VALUES 
  ('STR001', 'Delhi Metro Bridge - Line 1', 15.7, 65.2, 0.45, 23.5, 'critical', 28.6139, 77.2090, now() - interval '2 minutes'),
  ('STR002', 'Yamuna River Bridge', 8.3, 72.1, 0.23, 24.2, 'warning', 28.6304, 77.2177, now() - interval '5 minutes'),
  ('STR003', 'ITO Flyover', 5.2, 68.7, 0.15, 22.8, 'healthy', 28.6289, 77.2414, now() - interval '1 minute'),
  ('STR004', 'Ring Road Overpass', 6.1, 70.3, 0.18, 23.1, 'healthy', 28.5706, 77.3272, now() - interval '3 minutes');

-- Add more historical data for graphs
INSERT INTO public.sensor_data (
  structure_id, structure_name, vibration_frequency, humidity, strain_measurement, 
  temperature, status, latitude, longitude, timestamp
) 
SELECT 
  'STR001',
  'Delhi Metro Bridge - Line 1',
  15.0 + (random() * 3),
  60 + (random() * 15),
  0.4 + (random() * 0.2),
  20 + (random() * 8),
  CASE WHEN random() > 0.7 THEN 'critical' WHEN random() > 0.4 THEN 'warning' ELSE 'healthy' END,
  28.6139,
  77.2090,
  now() - (interval '1 hour' * generate_series(1, 24))
FROM generate_series(1, 24);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();