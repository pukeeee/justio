/**
 * Database types for Supabase
 * This file is manually maintained to reflect the database schema.
 * It should be kept in sync with migrations and Zod schemas.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ======================================================
      // Existing Tables (checked and verified)
      // ======================================================
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          settings: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      workspace_users: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["workspace_user_status"];
          invited_by: string | null;
          invited_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["workspace_user_status"];
          invited_by?: string | null;
          invited_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["workspace_user_status"];
          invited_by?: string | null;
          invited_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          workspace_id: string;
          tier: Database["public"]["Enums"]["subscription_tier"];
          status: Database["public"]["Enums"]["subscription_status"];
          billing_period: "monthly" | "annual";
          current_period_start: string;
          current_period_end: string;
          trial_ends_at: string | null;
          cancelled_at: string | null;
          payment_provider: "paddle" | "fondy" | "stripe" | null;
          external_subscription_id: string | null;
          enabled_modules: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          tier?: Database["public"]["Enums"]["subscription_tier"];
          status?: Database["public"]["Enums"]["subscription_status"];
          billing_period?: "monthly" | "annual";
          current_period_start?: string;
          current_period_end?: string;
          trial_ends_at?: string | null;
          cancelled_at?: string | null;
          payment_provider?: "paddle" | "fondy" | "stripe" | null;
          external_subscription_id?: string | null;
          enabled_modules?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          tier?: Database["public"]["Enums"]["subscription_tier"];
          status?: Database["public"]["Enums"]["subscription_status"];
          billing_period?: "monthly" | "annual";
          current_period_start?: string;
          current_period_end?: string;
          trial_ends_at?: string | null;
          cancelled_at?: string | null;
          payment_provider?: "paddle" | "fondy" | "stripe" | null;
          external_subscription_id?: string | null;
          enabled_modules?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      workspace_quotas: {
        Row: {
          workspace_id: string;
          max_users: number;
          max_contacts: number;
          max_deals: number;
          max_storage_mb: number;
          current_users: number;
          current_contacts: number;
          current_deals: number;
          current_storage_mb: number;
          updated_at: string;
        };
        Insert: {
          workspace_id: string;
          max_users?: number;
          max_contacts?: number;
          max_deals?: number;
          max_storage_mb?: number;
          current_users?: number;
          current_contacts?: number;
          current_deals?: number;
          current_storage_mb?: number;
          updated_at?: string;
        };
        Update: {
          workspace_id?: string;
          max_users?: number;
          max_contacts?: number;
          max_deals?: number;
          max_storage_mb?: number;
          current_users?: number;
          current_contacts?: number;
          current_deals?: number;
          current_storage_mb?: number;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string | null;
          first_name: string;
          last_name: string;
          middle_name: string | null;
          full_name: string;
          phones: Json;
          emails: Json;
          position: string | null;
          status: Database["public"]["Enums"]["contact_status"];
          tags: string[];
          source: string | null;
          owner_id: string | null;
          custom_fields: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id?: string | null;
          first_name: string;
          last_name: string;
          middle_name?: string | null;
          phones?: Json;
          emails?: Json;
          position?: string | null;
          status?: Database["public"]["Enums"]["contact_status"];
          tags?: string[];
          source?: string | null;
          owner_id?: string | null;
          custom_fields?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string | null;
          first_name?: string;
          last_name?: string;
          middle_name?: string | null;
          phones?: Json;
          emails?: Json;
          position?: string | null;
          status?: Database["public"]["Enums"]["contact_status"];
          tags?: string[];
          source?: string | null;
          owner_id?: string | null;
          custom_fields?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      companies: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          legal_name: string | null;
          edrpou: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          address: Json;
          status: Database["public"]["Enums"]["company_status"];
          tags: string[];
          source: string | null;
          owner_id: string | null;
          custom_fields: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          legal_name?: string | null;
          edrpou?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: Json;
          status?: Database["public"]["Enums"]["company_status"];
          tags?: string[];
          source?: string | null;
          owner_id?: string | null;
          custom_fields?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          legal_name?: string | null;
          edrpou?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: Json;
          status?: Database["public"]["Enums"]["company_status"];
          tags?: string[];
          source?: string | null;
          owner_id?: string | null;
          custom_fields?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      pipelines: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          is_default: boolean;
          stages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          is_default?: boolean;
          stages: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          is_default?: boolean;
          stages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          workspace_id: string;
          pipeline_id: string;
          stage_id: string;
          title: string;
          amount: number;
          currency: string;
          probability: number;
          contact_id: string | null;
          company_id: string | null;
          owner_id: string;
          expected_close_date: string | null;
          actual_close_date: string | null;
          status: Database["public"]["Enums"]["deal_status"];
          lost_reason: string | null;
          tags: string[];
          custom_fields: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          pipeline_id: string;
          stage_id: string;
          title: string;
          amount?: number;
          currency?: string;
          probability?: number;
          contact_id?: string | null;
          company_id?: string | null;
          owner_id: string;
          expected_close_date?: string | null;
          actual_close_date?: string | null;
          status?: Database["public"]["Enums"]["deal_status"];
          lost_reason?: string | null;
          tags?: string[];
          custom_fields?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          pipeline_id?: string;
          stage_id?: string;
          title?: string;
          amount?: number;
          currency?: string;
          probability?: number;
          contact_id?: string | null;
          company_id?: string | null;
          owner_id?: string;
          expected_close_date?: string | null;
          actual_close_date?: string | null;
          status?: Database["public"]["Enums"]["deal_status"];
          lost_reason?: string | null;
          tags?: string[];
          custom_fields?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      deal_products: {
        Row: {
          id: string;
          deal_id: string;
          product_id: string | null;
          name: string;
          quantity: number;
          price: number;
          discount: number;
          total: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          deal_id: string;
          product_id?: string | null;
          name: string;
          quantity?: number;
          price: number;
          discount?: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          deal_id?: string;
          product_id?: string | null;
          name?: string;
          quantity?: number;
          price?: number;
          discount?: number;
          notes?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          workspace_id: string;
          category_id: string | null;
          name: string;
          sku: string | null;
          description: string | null;
          price: number;
          currency: string;
          unit: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          category_id?: string | null;
          name: string;
          sku?: string | null;
          description?: string | null;
          price: number;
          currency?: string;
          unit?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          category_id?: string | null;
          name?: string;
          sku?: string | null;
          description?: string | null;
          price?: number;
          currency?: string;
          unit?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          description: string | null;
          task_type: Database["public"]["Enums"]["task_type"];
          created_by: string;
          assigned_to: string;
          status: Database["public"]["Enums"]["task_status"];
          priority: Database["public"]["Enums"]["task_priority"];
          due_date: string;
          completed_at: string | null;
          reminders: Json;
          contact_id: string | null;
          deal_id: string | null;
          result: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          description?: string | null;
          task_type: Database["public"]["Enums"]["task_type"];
          created_by: string;
          assigned_to: string;
          status?: Database["public"]["Enums"]["task_status"];
          priority?: Database["public"]["Enums"]["task_priority"];
          due_date: string;
          completed_at?: string | null;
          reminders?: Json;
          contact_id?: string | null;
          deal_id?: string | null;
          result?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          description?: string | null;
          task_type?: Database["public"]["Enums"]["task_type"];
          created_by?: string;
          assigned_to?: string;
          status?: Database["public"]["Enums"]["task_status"];
          priority?: Database["public"]["Enums"]["task_priority"];
          due_date?: string;
          completed_at?: string | null;
          reminders?: Json;
          contact_id?: string | null;
          deal_id?: string | null;
          result?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      activities: {
        Row: {
          id: string;
          workspace_id: string;
          activity_type: Database["public"]["Enums"]["activity_type"];
          content: string | null;
          metadata: Json;
          contact_id: string | null;
          deal_id: string | null;
          company_id: string | null;
          task_id: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          activity_type: Database["public"]["Enums"]["activity_type"];
          content?: string | null;
          metadata?: Json;
          contact_id?: string | null;
          deal_id?: string | null;
          company_id?: string | null;
          task_id?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          activity_type?: Database["public"]["Enums"]["activity_type"];
          content?: string | null;
          metadata?: Json;
          contact_id?: string | null;
          deal_id?: string | null;
          company_id?: string | null;
          task_id?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          link: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          link?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string | null;
          link?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          original_name: string;
          size_bytes: number;
          mime_type: string;
          storage_path: string;
          contact_id: string | null;
          deal_id: string | null;
          company_id: string | null;
          uploaded_by: string;
          uploaded_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          original_name: string;
          size_bytes: number;
          mime_type: string;
          storage_path: string;
          contact_id?: string | null;
          deal_id?: string | null;
          company_id?: string | null;
          uploaded_by: string;
          uploaded_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          original_name?: string;
          size_bytes?: number;
          mime_type?: string;
          storage_path?: string;
          contact_id?: string | null;
          deal_id?: string | null;
          company_id?: string | null;
          uploaded_by?: string;
          uploaded_at?: string;
          deleted_at?: string | null;
        };
      };

      // ======================================================
      // Missing Tables (Added)
      // ======================================================
      payments: {
        Row: {
          id: string;
          subscription_id: string;
          workspace_id: string;
          amount: number;
          currency: string;
          status: Database["public"]["Enums"]["payment_status"];
          payment_provider: string;
          external_payment_id: string | null;
          invoice_url: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          workspace_id: string;
          amount: number;
          currency?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          payment_provider: string;
          external_payment_id?: string | null;
          invoice_url?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          workspace_id?: string;
          amount?: number;
          currency?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          payment_provider?: string;
          external_payment_id?: string | null;
          invoice_url?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      deal_stage_history: {
        Row: {
          id: string;
          deal_id: string;
          from_stage_id: string | null;
          to_stage_id: string;
          user_id: string;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          from_stage_id?: string | null;
          to_stage_id: string;
          user_id: string;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          from_stage_id?: string | null;
          to_stage_id?: string;
          user_id?: string;
          duration_seconds?: number | null;
          created_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          workspace_id: string;
          parent_id: string | null;
          name: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          parent_id?: string | null;
          name: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          parent_id?: string | null;
          name?: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_price_history: {
        Row: {
          id: string;
          product_id: string;
          old_price: number | null;
          new_price: number;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          old_price?: number | null;
          new_price: number;
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          old_price?: number | null;
          new_price?: number;
          changed_by?: string | null;
          changed_at?: string;
        };
      };
      integrations: {
        Row: {
          workspace_id: string;
          nova_poshta_api_key: string | null;
          nova_poshta_settings: Json;
          smtp_settings: Json;
          sms_settings: Json;
          updated_at: string;
        };
        Insert: {
          workspace_id: string;
          nova_poshta_api_key?: string | null;
          nova_poshta_settings?: Json;
          smtp_settings?: Json;
          sms_settings?: Json;
          updated_at?: string;
        };
        Update: {
          workspace_id?: string;
          nova_poshta_api_key?: string | null;
          nova_poshta_settings?: Json;
          smtp_settings?: Json;
          sms_settings?: Json;
          updated_at?: string;
        };
      };
    };
    Enums: {
      user_role: "owner" | "admin" | "manager" | "user" | "guest";
      workspace_user_status: "pending" | "active" | "suspended";
      subscription_tier: "free" | "starter" | "pro" | "enterprise";
      subscription_status: "trialing" | "active" | "past_due" | "cancelled";
      contact_status: "new" | "qualified" | "customer" | "lost";
      company_status: "lead" | "active" | "inactive";
      deal_status: "open" | "won" | "lost" | "cancelled";
      task_type: "call" | "meeting" | "email" | "todo";
      task_status: "pending" | "in_progress" | "completed" | "cancelled";
      task_priority: "low" | "medium" | "high";
      activity_type:
        | "note"
        | "call"
        | "email"
        | "status_change"
        | "file_upload"
        | "created"
        | "updated";
      payment_status: "pending" | "completed" | "failed" | "refunded";
    };
    Functions: {
      get_current_workspace_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_current_user_role: {
        Args: { p_workspace_id?: string };
        Returns: Database["public"]["Enums"]["user_role"];
      };
    };
  };
}
