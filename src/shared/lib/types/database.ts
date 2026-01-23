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
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          company_id: string | null
          contact_id: string | null
          content: string | null
          created_at: string
          deal_id: string | null
          id: string
          metadata: Json | null
          task_id: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          company_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          task_id?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          company_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          task_id?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: Json | null
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          deleted_at: string | null
          edrpou: string | null
          email: string | null
          id: string
          legal_name: string | null
          name: string
          owner_id: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["company_status"] | null
          tags: string[] | null
          updated_at: string
          website: string | null
          workspace_id: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          edrpou?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["company_status"] | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
          workspace_id: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          edrpou?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["company_status"] | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          deleted_at: string | null
          emails: Json | null
          first_name: string
          full_name: string | null
          id: string
          last_name: string
          middle_name: string | null
          owner_id: string | null
          phones: Json | null
          position: string | null
          source: string | null
          status: Database["public"]["Enums"]["contact_status"] | null
          tags: string[] | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          emails?: Json | null
          first_name: string
          full_name?: string | null
          id?: string
          last_name: string
          middle_name?: string | null
          owner_id?: string | null
          phones?: Json | null
          position?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"] | null
          tags?: string[] | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          emails?: Json | null
          first_name?: string
          full_name?: string | null
          id?: string
          last_name?: string
          middle_name?: string | null
          owner_id?: string | null
          phones?: Json | null
          position?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"] | null
          tags?: string[] | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_products: {
        Row: {
          deal_id: string
          discount: number | null
          id: string
          name: string
          notes: string | null
          price: number
          product_id: string | null
          quantity: number
          total: number | null
        }
        Insert: {
          deal_id: string
          discount?: number | null
          id?: string
          name: string
          notes?: string | null
          price: number
          product_id?: string | null
          quantity?: number
          total?: number | null
        }
        Update: {
          deal_id?: string
          discount?: number | null
          id?: string
          name?: string
          notes?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_products_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stage_history: {
        Row: {
          created_at: string
          deal_id: string
          duration_seconds: number | null
          from_stage_id: string | null
          id: string
          to_stage_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          duration_seconds?: number | null
          from_stage_id?: string | null
          id?: string
          to_stage_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          duration_seconds?: number | null
          from_stage_id?: string | null
          id?: string
          to_stage_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          amount: number
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          custom_fields: Json | null
          deleted_at: string | null
          expected_close_date: string | null
          id: string
          lost_reason: string | null
          owner_id: string
          pipeline_id: string
          probability: number | null
          stage_id: string
          status: Database["public"]["Enums"]["deal_status"] | null
          tags: string[] | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          actual_close_date?: string | null
          amount?: number
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_fields?: Json | null
          deleted_at?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          owner_id: string
          pipeline_id: string
          probability?: number | null
          stage_id: string
          status?: Database["public"]["Enums"]["deal_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          actual_close_date?: string | null
          amount?: number
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_fields?: Json | null
          deleted_at?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          owner_id?: string
          pipeline_id?: string
          probability?: number | null
          stage_id?: string
          status?: Database["public"]["Enums"]["deal_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          company_id: string | null
          contact_id: string | null
          deal_id: string | null
          deleted_at: string | null
          id: string
          mime_type: string
          name: string
          original_name: string
          size_bytes: number
          storage_path: string
          uploaded_at: string
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          deal_id?: string | null
          deleted_at?: string | null
          id?: string
          mime_type: string
          name: string
          original_name: string
          size_bytes: number
          storage_path: string
          uploaded_at?: string
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          deal_id?: string | null
          deleted_at?: string | null
          id?: string
          mime_type?: string
          name?: string
          original_name?: string
          size_bytes?: number
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          nova_poshta_api_key: string | null
          nova_poshta_settings: Json | null
          sms_settings: Json | null
          smtp_settings: Json | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          nova_poshta_api_key?: string | null
          nova_poshta_settings?: Json | null
          sms_settings?: Json | null
          smtp_settings?: Json | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          nova_poshta_api_key?: string | null
          nova_poshta_settings?: Json | null
          sms_settings?: Json | null
          smtp_settings?: Json | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          external_payment_id: string | null
          id: string
          invoice_url: string | null
          payment_provider: string
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string
          workspace_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_payment_id?: string | null
          id?: string
          invoice_url?: string | null
          payment_provider: string
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id: string
          workspace_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_payment_id?: string | null
          id?: string
          invoice_url?: string | null
          payment_provider?: string
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          stages: Json
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          stages?: Json
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          stages?: Json
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          order_index: number | null
          parent_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_index?: number | null
          parent_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_index?: number | null
          parent_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_price: number
          old_price: number | null
          product_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_price: number
          old_price?: number | null
          product_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_price?: number
          old_price?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sku: string | null
          unit: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sku?: string | null
          unit?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sku?: string | null
          unit?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_period: string | null
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          enabled_modules: string[] | null
          external_subscription_id: string | null
          id: string
          payment_provider: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          billing_period?: string | null
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          enabled_modules?: string[] | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          billing_period?: string | null
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          enabled_modules?: string[] | null
          external_subscription_id?: string | null
          id?: string
          payment_provider?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          trial_ends_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string
          completed_at: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          deal_id: string | null
          deleted_at: string | null
          description: string | null
          due_date: string
          id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          reminders: Json | null
          result: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          deal_id?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          reminders?: Json | null
          result?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          deal_id?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          reminders?: Json | null
          result?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_quotas: {
        Row: {
          current_contacts: number
          current_deals: number
          current_storage_mb: number
          current_users: number
          max_contacts: number
          max_deals: number
          max_storage_mb: number
          max_users: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          current_contacts?: number
          current_deals?: number
          current_storage_mb?: number
          current_users?: number
          max_contacts?: number
          max_deals?: number
          max_storage_mb?: number
          max_users?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          current_contacts?: number
          current_deals?: number
          current_storage_mb?: number
          current_users?: number
          max_contacts?: number
          max_deals?: number
          max_storage_mb?: number
          max_users?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_quotas_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_users: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["workspace_user_status"]
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["workspace_user_status"]
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["workspace_user_status"]
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          owner_id: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_workspace_with_owner: {
        Args: { p_name: string }
        Returns: {
          workspace_id: string
          workspace_name: string
          workspace_slug: string
        }[]
      }
      generate_invitation_token: { Args: never; Returns: string }
      generate_random_slug: { Args: never; Returns: string }
      get_workspace_role: {
        Args: { p_user_id: string; p_workspace_id: string }
        Returns: string
      }
      is_workspace_member: {
        Args: { p_user_id: string; p_workspace_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "note"
        | "call"
        | "email"
        | "status_change"
        | "file_upload"
        | "created"
        | "updated"
      company_status: "lead" | "active" | "inactive"
      contact_status: "new" | "qualified" | "customer" | "lost"
      deal_status: "open" | "won" | "lost" | "cancelled"
      invitation_status: "pending" | "accepted" | "expired" | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      subscription_status: "trialing" | "active" | "past_due" | "cancelled"
      subscription_tier: "free" | "starter" | "pro" | "enterprise"
      task_priority: "low" | "medium" | "high"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      task_type: "call" | "meeting" | "email" | "todo"
      user_role: "owner" | "admin" | "manager" | "user" | "guest"
      workspace_user_status: "pending" | "active" | "suspended"
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
      activity_type: [
        "note",
        "call",
        "email",
        "status_change",
        "file_upload",
        "created",
        "updated",
      ],
      company_status: ["lead", "active", "inactive"],
      contact_status: ["new", "qualified", "customer", "lost"],
      deal_status: ["open", "won", "lost", "cancelled"],
      invitation_status: ["pending", "accepted", "expired", "cancelled"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      subscription_status: ["trialing", "active", "past_due", "cancelled"],
      subscription_tier: ["free", "starter", "pro", "enterprise"],
      task_priority: ["low", "medium", "high"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_type: ["call", "meeting", "email", "todo"],
      user_role: ["owner", "admin", "manager", "user", "guest"],
      workspace_user_status: ["pending", "active", "suspended"],
    },
  },
} as const
