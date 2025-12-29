-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint TEXT NOT NULL,
  history_of_complaint TEXT,
  dental_history TEXT,
  medical_history TEXT,
  family_history TEXT,
  current_medications TEXT,
  allergies TEXT,
  extra_oral_examination TEXT,
  intra_oral_examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage medical records in their clinic"
ON public.medical_records
FOR ALL
USING (clinic_id = get_user_clinic_id(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_clinic_id ON public.medical_records(clinic_id);