-- =============================================
-- PATIENTS MODULE
-- =============================================

-- Main patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  address TEXT,
  city TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  avatar_url TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient allergies
CREATE TABLE public.patient_allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  allergy_name TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')) DEFAULT 'moderate',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient medications
CREATE TABLE public.patient_medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  prescribing_doctor TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient medical history
CREATE TABLE public.patient_medical_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  condition TEXT NOT NULL,
  diagnosis_date DATE,
  status TEXT CHECK (status IN ('active', 'resolved', 'chronic')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- APPOINTMENTS MODULE
-- =============================================

CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.appointment_type AS ENUM ('consultation', 'follow_up', 'procedure', 'emergency', 'telemedicine');

CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  appointment_type appointment_type NOT NULL DEFAULT 'consultation',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  telemedicine_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- BILLING MODULE
-- =============================================

CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'esewa', 'khalti', 'insurance', 'other');

CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reference_number TEXT,
  proof_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INVENTORY MODULE
-- =============================================

CREATE TABLE public.inventory_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  unit TEXT DEFAULT 'pcs',
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 10,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  expiry_date DATE,
  supplier_name TEXT,
  supplier_contact TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SHOWCASE MODULE
-- =============================================

CREATE TABLE public.showcase_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  before_image_url TEXT,
  after_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.showcase_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_photo_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  treatment_type TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.showcase_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  benefits TEXT[],
  price_range TEXT,
  duration TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  specialization TEXT,
  qualifications TEXT[],
  bio TEXT,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Patients policies
CREATE POLICY "Users can view patients in their clinic" ON public.patients
  FOR SELECT USING (clinic_id = public.get_user_clinic_id(auth.uid()));
  
CREATE POLICY "Users can insert patients in their clinic" ON public.patients
  FOR INSERT WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));
  
CREATE POLICY "Users can update patients in their clinic" ON public.patients
  FOR UPDATE USING (clinic_id = public.get_user_clinic_id(auth.uid()));
  
CREATE POLICY "Users can delete patients in their clinic" ON public.patients
  FOR DELETE USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Patient allergies policies
CREATE POLICY "Users can manage patient allergies" ON public.patient_allergies
  FOR ALL USING (patient_id IN (SELECT id FROM public.patients WHERE clinic_id = public.get_user_clinic_id(auth.uid())));

-- Patient medications policies
CREATE POLICY "Users can manage patient medications" ON public.patient_medications
  FOR ALL USING (patient_id IN (SELECT id FROM public.patients WHERE clinic_id = public.get_user_clinic_id(auth.uid())));

-- Patient medical history policies
CREATE POLICY "Users can manage patient medical history" ON public.patient_medical_history
  FOR ALL USING (patient_id IN (SELECT id FROM public.patients WHERE clinic_id = public.get_user_clinic_id(auth.uid())));

-- Appointments policies
CREATE POLICY "Users can view appointments in their clinic" ON public.appointments
  FOR SELECT USING (clinic_id = public.get_user_clinic_id(auth.uid()));
  
CREATE POLICY "Users can insert appointments in their clinic" ON public.appointments
  FOR INSERT WITH CHECK (clinic_id = public.get_user_clinic_id(auth.uid()));
  
CREATE POLICY "Users can update appointments in their clinic" ON public.appointments
  FOR UPDATE USING (clinic_id = public.get_user_clinic_id(auth.uid()));
  
CREATE POLICY "Users can delete appointments in their clinic" ON public.appointments
  FOR DELETE USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Invoices policies
CREATE POLICY "Users can manage invoices in their clinic" ON public.invoices
  FOR ALL USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Invoice items policies
CREATE POLICY "Users can manage invoice items" ON public.invoice_items
  FOR ALL USING (invoice_id IN (SELECT id FROM public.invoices WHERE clinic_id = public.get_user_clinic_id(auth.uid())));

-- Payments policies
CREATE POLICY "Users can manage payments in their clinic" ON public.payments
  FOR ALL USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Inventory categories policies
CREATE POLICY "Users can manage inventory categories" ON public.inventory_categories
  FOR ALL USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Inventory items policies
CREATE POLICY "Users can manage inventory items" ON public.inventory_items
  FOR ALL USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Showcase portfolio policies
CREATE POLICY "Users can manage showcase portfolio" ON public.showcase_portfolio
  FOR ALL USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Showcase testimonials policies
CREATE POLICY "Users can manage testimonials" ON public.showcase_testimonials
  FOR ALL USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Showcase services policies
CREATE POLICY "Users can manage services" ON public.showcase_services
  FOR ALL USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- Team members policies
CREATE POLICY "Users can manage team members" ON public.team_members
  FOR ALL USING (clinic_id = public.get_user_clinic_id(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX idx_appointments_clinic_date ON public.appointments(clinic_id, scheduled_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_invoices_clinic_id ON public.invoices(clinic_id);
CREATE INDEX idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_inventory_items_clinic ON public.inventory_items(clinic_id);