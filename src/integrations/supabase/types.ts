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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      championship_config: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          year?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          car_model: string | null
          championship_id: string
          created_at: string
          id: string
          name: string
          number: number | null
          team: string | null
          updated_at: string
        }
        Insert: {
          car_model?: string | null
          championship_id: string
          created_at?: string
          id?: string
          name: string
          number?: number | null
          team?: string | null
          updated_at?: string
        }
        Update: {
          car_model?: string | null
          championship_id?: string
          created_at?: string
          id?: string
          name?: string
          number?: number | null
          team?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championship_config"
            referencedColumns: ["id"]
          },
        ]
      }
      previous_standings: {
        Row: {
          c2r2_position: number | null
          championship_id: string
          created_at: string
          driver_id: string
          general_position: number | null
          id: string
          montagne_points: number
          montagne_position: number | null
          position: number
          rallye_points: number
          rallye_position: number | null
          save_name: string | null
          saved_at: string | null
          standing_type: string | null
          total_points: number
        }
        Insert: {
          c2r2_position?: number | null
          championship_id: string
          created_at?: string
          driver_id: string
          general_position?: number | null
          id?: string
          montagne_points?: number
          montagne_position?: number | null
          position: number
          rallye_points?: number
          rallye_position?: number | null
          save_name?: string | null
          saved_at?: string | null
          standing_type?: string | null
          total_points?: number
        }
        Update: {
          c2r2_position?: number | null
          championship_id?: string
          created_at?: string
          driver_id?: string
          general_position?: number | null
          id?: string
          montagne_points?: number
          montagne_position?: number | null
          position?: number
          rallye_points?: number
          rallye_position?: number | null
          save_name?: string | null
          saved_at?: string | null
          standing_type?: string | null
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "previous_standings_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championship_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "previous_standings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      race_results: {
        Row: {
          bonus: number | null
          car_model: string | null
          category: string | null
          created_at: string
          dnf: boolean | null
          driver_id: string
          id: string
          points: number
          position: number
          race_id: string
          time: string | null
          updated_at: string
        }
        Insert: {
          bonus?: number | null
          car_model?: string | null
          category?: string | null
          created_at?: string
          dnf?: boolean | null
          driver_id: string
          id?: string
          points?: number
          position: number
          race_id: string
          time?: string | null
          updated_at?: string
        }
        Update: {
          bonus?: number | null
          car_model?: string | null
          category?: string | null
          created_at?: string
          dnf?: boolean | null
          driver_id?: string
          id?: string
          points?: number
          position?: number
          race_id?: string
          time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_results_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_results_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      race_results_archive: {
        Row: {
          bonus: number | null
          car_model: string | null
          category: string | null
          championship_id: string
          created_at: string
          dnf: boolean | null
          driver_id: string
          id: string
          points: number
          position: number
          race_id: string
          save_name: string | null
          saved_at: string
          standing_type: string | null
          time: string | null
        }
        Insert: {
          bonus?: number | null
          car_model?: string | null
          category?: string | null
          championship_id: string
          created_at?: string
          dnf?: boolean | null
          driver_id: string
          id?: string
          points?: number
          position: number
          race_id: string
          save_name?: string | null
          saved_at: string
          standing_type?: string | null
          time?: string | null
        }
        Update: {
          bonus?: number | null
          car_model?: string | null
          category?: string | null
          championship_id?: string
          created_at?: string
          dnf?: boolean | null
          driver_id?: string
          id?: string
          points?: number
          position?: number
          race_id?: string
          save_name?: string | null
          saved_at?: string
          standing_type?: string | null
          time?: string | null
        }
        Relationships: []
      }
      races: {
        Row: {
          championship_id: string
          created_at: string
          date: string
          end_date: string | null
          id: string
          name: string
          organizer: string | null
          type: string
          updated_at: string
        }
        Insert: {
          championship_id: string
          created_at?: string
          date: string
          end_date?: string | null
          id?: string
          name: string
          organizer?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          championship_id?: string
          created_at?: string
          date?: string
          end_date?: string | null
          id?: string
          name?: string
          organizer?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "races_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championship_config"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_previous_standings: {
        Args: { p_championship_id: string }
        Returns: undefined
      }
      delete_all_drivers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_standings_save_by_type: {
        Args: {
          p_championship_id: string
          p_saved_at: string
          p_standing_type: string
        }
        Returns: undefined
      }
      get_missing_drivers: {
        Args: { race_id_param?: string }
        Returns: {
          driver_id: string
        }[]
      }
      get_standings_saves_by_type: {
        Args: { p_championship_id: string; p_standing_type?: string }
        Returns: {
          drivers_count: number
          save_name: string
          saved_at: string
          standing_type: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { role_name: string }
        Returns: boolean
      }
      reset_drivers_evolution: {
        Args: Record<PropertyKey, never> | { p_championship_id?: string }
        Returns: undefined
      }
      restore_previous_standings: {
        Args: Record<PropertyKey, never> | { p_championship_id?: string }
        Returns: undefined
      }
      restore_standings_by_type: {
        Args: {
          p_championship_id: string
          p_saved_at: string
          p_standing_type: string
        }
        Returns: undefined
      }
      save_current_standings_as_previous: {
        Args: Record<PropertyKey, never> | { p_championship_id?: string }
        Returns: undefined
      }
      save_standings_by_type: {
        Args: {
          p_championship_id: string
          p_save_name?: string
          p_standing_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
