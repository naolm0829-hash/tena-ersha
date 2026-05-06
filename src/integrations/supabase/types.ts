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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_diagnoses: {
        Row: {
          advice: string
          confidence: number
          created_at: string
          diagnosis_name: string
          id: string
          image_url: string | null
          scan_type: string
          user_id: string
        }
        Insert: {
          advice: string
          confidence: number
          created_at?: string
          diagnosis_name: string
          id?: string
          image_url?: string | null
          scan_type?: string
          user_id: string
        }
        Update: {
          advice?: string
          confidence?: number
          created_at?: string
          diagnosis_name?: string
          id?: string
          image_url?: string | null
          scan_type?: string
          user_id?: string
        }
        Relationships: []
      }
      animal_health_records: {
        Row: {
          animal_name: string
          animal_type: string
          created_at: string
          id: string
          last_checkup: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          animal_name: string
          animal_type: string
          created_at?: string
          id?: string
          last_checkup?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          animal_name?: string
          animal_type?: string
          created_at?: string
          id?: string
          last_checkup?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bulk_requests: {
        Row: {
          buyer_id: string
          contact: string | null
          created_at: string
          crop: string
          id: string
          max_price_per_quintal: number | null
          needed_by: string | null
          notes: string | null
          quantity_quintals: number
          region: string | null
          status: string
        }
        Insert: {
          buyer_id: string
          contact?: string | null
          created_at?: string
          crop: string
          id?: string
          max_price_per_quintal?: number | null
          needed_by?: string | null
          notes?: string | null
          quantity_quintals: number
          region?: string | null
          status?: string
        }
        Update: {
          buyer_id?: string
          contact?: string | null
          created_at?: string
          crop?: string
          id?: string
          max_price_per_quintal?: number | null
          needed_by?: string | null
          notes?: string | null
          quantity_quintals?: number
          region?: string | null
          status?: string
        }
        Relationships: []
      }
      crop_calendar_entries: {
        Row: {
          created_at: string
          crop_name: string
          crop_name_am: string
          harvest_months: number[]
          id: string
          is_active: boolean
          planting_months: number[]
          regions: string[]
          sort_order: number
          tips: string
          tips_am: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crop_name: string
          crop_name_am: string
          harvest_months?: number[]
          id?: string
          is_active?: boolean
          planting_months?: number[]
          regions?: string[]
          sort_order?: number
          tips?: string
          tips_am?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crop_name?: string
          crop_name_am?: string
          harvest_months?: number[]
          id?: string
          is_active?: boolean
          planting_months?: number[]
          regions?: string[]
          sort_order?: number
          tips?: string
          tips_am?: string
          updated_at?: string
        }
        Relationships: []
      }
      crop_prices: {
        Row: {
          created_at: string
          crop_name: string
          crop_name_am: string
          id: string
          price_per_quintal: number
          recorded_at: string
          region: string
        }
        Insert: {
          created_at?: string
          crop_name: string
          crop_name_am: string
          id?: string
          price_per_quintal: number
          recorded_at?: string
          region: string
        }
        Update: {
          created_at?: string
          crop_name?: string
          crop_name_am?: string
          id?: string
          price_per_quintal?: number
          recorded_at?: string
          region?: string
        }
        Relationships: []
      }
      disease_reports: {
        Row: {
          created_at: string
          disease: string
          disease_am: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          region: string
          region_am: string
          report_count: number
          reported_at: string
          severity: string
        }
        Insert: {
          created_at?: string
          disease: string
          disease_am: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          region: string
          region_am: string
          report_count?: number
          reported_at?: string
          severity?: string
        }
        Update: {
          created_at?: string
          disease?: string
          disease_am?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          region?: string
          region_am?: string
          report_count?: number
          reported_at?: string
          severity?: string
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount: number
          buyer_confirmed: boolean
          buyer_id: string
          created_at: string
          id: string
          listing_id: string | null
          released_at: string | null
          seller_confirmed: boolean
          seller_id: string
          status: string
          telebirr_reference: string | null
        }
        Insert: {
          amount: number
          buyer_confirmed?: boolean
          buyer_id: string
          created_at?: string
          id?: string
          listing_id?: string | null
          released_at?: string | null
          seller_confirmed?: boolean
          seller_id: string
          status?: string
          telebirr_reference?: string | null
        }
        Update: {
          amount?: number
          buyer_confirmed?: boolean
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string | null
          released_at?: string | null
          seller_confirmed?: boolean
          seller_id?: string
          status?: string
          telebirr_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          reviewer_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          contact: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          price: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      operator_listings: {
        Row: {
          available: boolean
          bio: string | null
          contact: string | null
          created_at: string
          experience_years: number
          full_name: string
          id: string
          location: string | null
          rate_per_day: number
          skills: string[]
          user_id: string
        }
        Insert: {
          available?: boolean
          bio?: string | null
          contact?: string | null
          created_at?: string
          experience_years?: number
          full_name: string
          id?: string
          location?: string | null
          rate_per_day?: number
          skills?: string[]
          user_id: string
        }
        Update: {
          available?: boolean
          bio?: string | null
          contact?: string | null
          created_at?: string
          experience_years?: number
          full_name?: string
          id?: string
          location?: string | null
          rate_per_day?: number
          skills?: string[]
          user_id?: string
        }
        Relationships: []
      }
      owned_tools: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          id: string
          manual_url: string | null
          model: string | null
          name: string
          notes: string | null
          owner_id: string
          qr_code: string | null
          serial_number: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string
          created_at?: string
          id?: string
          manual_url?: string | null
          model?: string | null
          name: string
          notes?: string | null
          owner_id: string
          qr_code?: string | null
          serial_number?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          id?: string
          manual_url?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          qr_code?: string | null
          serial_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          phone: string | null
          reference: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tier: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string
          phone?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tier?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          phone?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      rental_bookings: {
        Row: {
          created_at: string
          end_date: string
          id: string
          notes: string | null
          rental_id: string
          renter_id: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          rental_id: string
          renter_id: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          rental_id?: string
          renter_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_bookings_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "tool_rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          category: string | null
          created_at: string
          id: string
          keywords: string | null
          label: string
          max_price: number | null
          region: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          keywords?: string | null
          label: string
          max_price?: number | null
          region?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          keywords?: string | null
          label?: string
          max_price?: number | null
          region?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seller_verifications: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reviewed_by: string | null
          status: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      spare_parts: {
        Row: {
          category: string
          contact: string | null
          created_at: string
          fits: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          location: string | null
          name: string
          price: number
          seller_id: string
        }
        Insert: {
          category?: string
          contact?: string | null
          created_at?: string
          fits?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          location?: string | null
          name: string
          price?: number
          seller_id: string
        }
        Update: {
          category?: string
          contact?: string | null
          created_at?: string
          fits?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          location?: string | null
          name?: string
          price?: number
          seller_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_maintenance: {
        Row: {
          cost: number
          created_at: string
          fuel_liters: number | null
          hours_used: number | null
          id: string
          notes: string | null
          owner_id: string
          service_date: string
          service_type: string
          tool_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          fuel_liters?: number | null
          hours_used?: number | null
          id?: string
          notes?: string | null
          owner_id: string
          service_date?: string
          service_type: string
          tool_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          fuel_liters?: number | null
          hours_used?: number | null
          id?: string
          notes?: string | null
          owner_id?: string
          service_date?: string
          service_type?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_maintenance_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "owned_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_rentals: {
        Row: {
          category: string
          contact: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          location: string | null
          name: string
          owner_id: string
          price_per_day: number
          price_per_hour: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          location?: string | null
          name: string
          owner_id: string
          price_per_day?: number
          price_per_hour?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          location?: string | null
          name?: string
          owner_id?: string
          price_per_day?: number
          price_per_hour?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wisdom_remedies: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          method: string
          name: string
          sort_order: number
          target: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          method: string
          name: string
          sort_order?: number
          target: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          method?: string
          name?: string
          sort_order?: number
          target?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium: { Args: { _user: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
