export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string | null
          employee_id: string | null
          end_time: string
          id: number
          notes: string | null
          product_code: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          end_time: string
          id?: number
          notes?: string | null
          product_code?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          end_time?: string
          id?: number
          notes?: string | null
          product_code?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "assignments_product_code_fkey"
            columns: ["product_code"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_code"]
          },
        ]
      }
      constraints: {
        Row: {
          active: boolean | null
          constraint_type: string
          created_at: string | null
          description: string
          id: number
          parameters: Json | null
          priority: number | null
        }
        Insert: {
          active?: boolean | null
          constraint_type: string
          created_at?: string | null
          description: string
          id?: number
          parameters?: Json | null
          priority?: number | null
        }
        Update: {
          active?: boolean | null
          constraint_type?: string
          created_at?: string | null
          description?: string
          id?: number
          parameters?: Json | null
          priority?: number | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          available_monday: boolean | null
          available_tuesday: boolean | null
          available_wednesday: boolean | null
          created_at: string | null
          department: string | null
          employee_id: string | null
          id: number
          name: string | null
          shift: string | null
        }
        Insert: {
          available_monday?: boolean | null
          available_tuesday?: boolean | null
          available_wednesday?: boolean | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: number
          name?: string | null
          shift?: string | null
        }
        Update: {
          available_monday?: boolean | null
          available_tuesday?: boolean | null
          available_wednesday?: boolean | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: number
          name?: string | null
          shift?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          cost_per_kg: number | null
          created_at: string | null
          expiry_date: string | null
          id: number
          material_id: string | null
          name: string | null
          quantity_kg: number | null
        }
        Insert: {
          cost_per_kg?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: number
          material_id?: string | null
          name?: string | null
          quantity_kg?: number | null
        }
        Update: {
          cost_per_kg?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: number
          material_id?: string | null
          name?: string | null
          quantity_kg?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          batch_size: number | null
          batch_time: number | null
          created_at: string | null
          demand_units: number | null
          id: number
          materials_needed: string | null
          name: string | null
          priority: number | null
          product_code: string | null
        }
        Insert: {
          batch_size?: number | null
          batch_time?: number | null
          created_at?: string | null
          demand_units?: number | null
          id?: number
          materials_needed?: string | null
          name?: string | null
          priority?: number | null
          product_code?: string | null
        }
        Update: {
          batch_size?: number | null
          batch_time?: number | null
          created_at?: string | null
          demand_units?: number | null
          id?: number
          materials_needed?: string | null
          name?: string | null
          priority?: number | null
          product_code?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: number
          maintenance_schedule: Json | null
          name: string
          resource_id: string
          status: string | null
          type: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: number
          maintenance_schedule?: Json | null
          name: string
          resource_id: string
          status?: string | null
          type: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: number
          maintenance_schedule?: Json | null
          name?: string
          resource_id?: string
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string | null
          day: string | null
          duration_hours: number | null
          end_time: string | null
          id: number
          metadata: Json | null
          product_name: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string | null
          day?: string | null
          duration_hours?: number | null
          end_time?: string | null
          id?: number
          metadata?: Json | null
          product_name?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string | null
          day?: string | null
          duration_hours?: number | null
          end_time?: string | null
          id?: number
          metadata?: Json | null
          product_name?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
