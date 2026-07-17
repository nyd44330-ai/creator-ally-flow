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
      campaign_influencers: {
        Row: {
          campaign_id: string
          created_at: string
          influencer_id: string
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          influencer_id: string
          status?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          influencer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_influencers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_influencers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          advertiser_id: string
          budget: number
          content_type: string | null
          created_at: string
          deliverables: string | null
          end_date: string | null
          goal: string | null
          id: string
          name: string
          notes: string | null
          platforms: string[]
          spent: number
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          budget?: number
          content_type?: string | null
          created_at?: string
          deliverables?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          notes?: string | null
          platforms?: string[]
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          budget?: number
          content_type?: string | null
          created_at?: string
          deliverables?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          notes?: string | null
          platforms?: string[]
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          advertiser_id: string
          campaign_id: string | null
          created_at: string
          id: string
          influencer_id: string
          last_message: string | null
          last_message_at: string | null
        }
        Insert: {
          advertiser_id: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          influencer_id: string
          last_message?: string | null
          last_message_at?: string | null
        }
        Update: {
          advertiser_id?: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          influencer_id?: string
          last_message?: string | null
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          influencer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          influencer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          influencer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          bio: string | null
          category: string
          created_at: string
          featured: boolean
          id: string
          image: string
          instagram: string | null
          instagram_url: string | null
          languages: Json
          location: string | null
          name: string
          portfolio: Json
          price_max: number
          price_min: number
          rating: number
          reviews: number
          services: Json
          tiktok: string | null
          tiktok_url: string | null
          verified: boolean
          youtube: string | null
          youtube_url: string | null
        }
        Insert: {
          bio?: string | null
          category: string
          created_at?: string
          featured?: boolean
          id: string
          image: string
          instagram?: string | null
          instagram_url?: string | null
          languages?: Json
          location?: string | null
          name: string
          portfolio?: Json
          price_max?: number
          price_min?: number
          rating?: number
          reviews?: number
          services?: Json
          tiktok?: string | null
          tiktok_url?: string | null
          verified?: boolean
          youtube?: string | null
          youtube_url?: string | null
        }
        Update: {
          bio?: string | null
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          image?: string
          instagram?: string | null
          instagram_url?: string | null
          languages?: Json
          location?: string | null
          name?: string
          portfolio?: Json
          price_max?: number
          price_min?: number
          rating?: number
          reviews?: number
          services?: Json
          tiktok?: string | null
          tiktok_url?: string | null
          verified?: boolean
          youtube?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          advertiser_id: string
          amount: number
          campaign_id: string
          checkout_url: string | null
          created_at: string
          fee: number
          id: string
          method: string
          provider: string
          provider_ref: string | null
          status: string
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          amount: number
          campaign_id: string
          checkout_url?: string | null
          created_at?: string
          fee?: number
          id?: string
          method: string
          provider?: string
          provider_ref?: string | null
          status?: string
          tax?: number
          total: number
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          amount?: number
          campaign_id?: string
          checkout_url?: string | null
          created_at?: string
          fee?: number
          id?: string
          method?: string
          provider?: string
          provider_ref?: string | null
          status?: string
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          description: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
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
      campaign_status:
        | "draft"
        | "pending"
        | "active"
        | "completed"
        | "cancelled"
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
      campaign_status: ["draft", "pending", "active", "completed", "cancelled"],
    },
  },
} as const
