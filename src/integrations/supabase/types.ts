export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_type: Database["public"]["Enums"]["appointment_type"]
          clinic_id: string
          created_at: string
          description: string | null
          end_time: string
          id: string
          notes: string | null
          patient_id: string
          provider_id: string | null
          scheduled_date: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          telemedicine_link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_type?: Database["public"]["Enums"]["appointment_type"]
          clinic_id: string
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          notes?: string | null
          patient_id: string
          provider_id?: string | null
          scheduled_date: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          telemedicine_link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_type?: Database["public"]["Enums"]["appointment_type"]
          clinic_id?: string
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          patient_id?: string
          provider_id?: string | null
          scheduled_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          telemedicine_link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          clinic_type: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          slug: string
          subscription_ends_at: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          clinic_type?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          slug: string
          subscription_ends_at?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          clinic_type?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          slug?: string
          subscription_ends_at?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_categories: {
        Row: {
          clinic_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category_id: string | null
          clinic_id: string
          created_at: string
          description: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          location: string | null
          min_quantity: number
          name: string
          quantity: number
          selling_price: number | null
          sku: string | null
          supplier_contact: string | null
          supplier_name: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          clinic_id: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          min_quantity?: number
          name: string
          quantity?: number
          selling_price?: number | null
          sku?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          clinic_id?: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          min_quantity?: number
          name?: string
          quantity?: number
          selling_price?: number | null
          sku?: string | null
          supplier_contact?: string | null
          supplier_name?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          clinic_id: string
          created_at: string
          discount_amount: number
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          patient_id: string
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number
          patient_id: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          discount_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number
          patient_id?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_allergies: {
        Row: {
          allergy_name: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          severity: string | null
        }
        Insert: {
          allergy_name: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          severity?: string | null
        }
        Update: {
          allergy_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medical_history: {
        Row: {
          condition: string
          created_at: string
          diagnosis_date: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string | null
        }
        Insert: {
          condition: string
          created_at?: string
          diagnosis_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
        }
        Update: {
          condition?: string
          created_at?: string
          diagnosis_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_active: boolean
          medication_name: string
          notes: string | null
          patient_id: string
          prescribing_doctor: string | null
          start_date: string | null
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          medication_name: string
          notes?: string | null
          patient_id: string
          prescribing_doctor?: string | null
          start_date?: string | null
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          medication_name?: string
          notes?: string | null
          patient_id?: string
          prescribing_doctor?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          avatar_url: string | null
          blood_type: string | null
          city: string | null
          clinic_id: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean
          last_name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          blood_type?: string | null
          city?: string | null
          clinic_id: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          blood_type?: string | null
          city?: string | null
          clinic_id?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string
          id: string
          invoice_id: string
          is_verified: boolean
          notes: string | null
          patient_id: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          proof_url: string | null
          reference_number: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          clinic_id: string
          created_at?: string
          id?: string
          invoice_id: string
          is_verified?: boolean
          notes?: string | null
          patient_id: string
          payment_date?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          proof_url?: string | null
          reference_number?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string
          id?: string
          invoice_id?: string
          is_verified?: boolean
          notes?: string | null
          patient_id?: string
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          proof_url?: string | null
          reference_number?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          clinic_id: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_portfolio: {
        Row: {
          after_image_url: string | null
          before_image_url: string | null
          category: string
          clinic_id: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_published: boolean
          title: string
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          category: string
          clinic_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean
          title: string
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          category?: string
          clinic_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_portfolio_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_services: {
        Row: {
          benefits: string[] | null
          clinic_id: string
          created_at: string
          description: string | null
          display_order: number | null
          duration: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_range: string | null
        }
        Insert: {
          benefits?: string[] | null
          clinic_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_range?: string | null
        }
        Update: {
          benefits?: string[] | null
          clinic_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_range?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showcase_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_testimonials: {
        Row: {
          clinic_id: string
          content: string
          created_at: string
          id: string
          is_approved: boolean
          is_published: boolean
          patient_name: string
          patient_photo_url: string | null
          rating: number | null
          treatment_type: string | null
        }
        Insert: {
          clinic_id: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_published?: boolean
          patient_name: string
          patient_photo_url?: string | null
          rating?: number | null
          treatment_type?: string | null
        }
        Update: {
          clinic_id?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_published?: boolean
          patient_name?: string
          patient_photo_url?: string | null
          rating?: number | null
          treatment_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showcase_testimonials_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string | null
          clinic_id: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          profile_id: string | null
          qualifications: string[] | null
          specialization: string | null
          title: string
        }
        Insert: {
          bio?: string | null
          clinic_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          profile_id?: string | null
          qualifications?: string[] | null
          specialization?: string | null
          title: string
        }
        Update: {
          bio?: string | null
          clinic_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          profile_id?: string | null
          qualifications?: string[] | null
          specialization?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      has_clinic_role: {
        Args: {
          _clinic_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "clinic_admin" | "provider" | "reception" | "patient"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      appointment_type:
        | "consultation"
        | "follow_up"
        | "procedure"
        | "emergency"
        | "telemedicine"
      invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "partial"
        | "overdue"
        | "cancelled"
      payment_method:
        | "cash"
        | "card"
        | "bank_transfer"
        | "esewa"
        | "khalti"
        | "insurance"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["clinic_admin", "provider", "reception", "patient"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      appointment_type: [
        "consultation",
        "follow_up",
        "procedure",
        "emergency",
        "telemedicine",
      ],
      invoice_status: [
        "draft",
        "sent",
        "paid",
        "partial",
        "overdue",
        "cancelled",
      ],
      payment_method: [
        "cash",
        "card",
        "bank_transfer",
        "esewa",
        "khalti",
        "insurance",
        "other",
      ],
    },
  },
} as const
