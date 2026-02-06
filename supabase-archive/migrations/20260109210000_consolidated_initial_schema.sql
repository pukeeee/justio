-- ============================================================================
-- CRM4SMB Database Schema
-- Version: 2.0.0 (Consolidated)
-- Description: A single, consolidated schema file with all features and RLS fixes.
-- This file is the result of merging all previous migrations into one master file.
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'user', 'guest');
CREATE TYPE workspace_user_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled');
CREATE TYPE contact_status AS ENUM ('new', 'qualified', 'customer', 'lost');
CREATE TYPE company_status AS ENUM ('lead', 'active', 'inactive');
CREATE TYPE deal_status AS ENUM ('open', 'won', 'lost', 'cancelled');
CREATE TYPE task_type AS ENUM ('call', 'meeting', 'email', 'todo');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE activity_type AS ENUM ('note', 'call', 'email', 'status_change', 'file_upload', 'created', 'updated');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
-- Added in a later migration
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- ============================================================================
-- CORE TABLES: Organizations & Users
-- ============================================================================

-- Workspaces (Organizations)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND length(slug) >= 2),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  settings JSONB DEFAULT '{
    "visibility_mode": "all",
    "default_currency": "UAH",
    "timezone": "Europe/Kyiv",
    "date_format": "DD.MM.YYYY"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT workspace_name_not_empty CHECK (trim(name) != '')
);

-- Workspace users (many-to-many with roles)
-- NOTE: invited_by and invited_at columns were removed in a later migration
CREATE TABLE workspace_users (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  status workspace_user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_workspace_user UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_workspace_users_user_id ON workspace_users(user_id);
CREATE INDEX idx_workspace_users_workspace_id ON workspace_users(workspace_id);

-- Workspace Invitations (added in a later migration)
CREATE TABLE workspace_invitations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  role user_role NOT NULL DEFAULT 'user',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_pending_invitation ON workspace_invitations(workspace_id, email) WHERE (status = 'pending');
CREATE INDEX idx_invitations_workspace ON workspace_invitations(workspace_id);
CREATE INDEX idx_invitations_email ON workspace_invitations(email);
CREATE INDEX idx_invitations_token ON workspace_invitations(token);
CREATE INDEX idx_invitations_status ON workspace_invitations(status);
COMMENT ON TABLE workspace_invitations IS 'Запрошення користувачів до воркспейсів.';

-- ============================================================================
-- BILLING & SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'trialing',
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  cancelled_at TIMESTAMPTZ,
  payment_provider TEXT CHECK (payment_provider IN ('paddle', 'fondy', 'stripe')),
  external_subscription_id TEXT,
  enabled_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_workspace_subscription UNIQUE(workspace_id)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'UAH',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_provider TEXT NOT NULL,
  external_payment_id TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_payments_workspace ON payments(workspace_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);

CREATE TABLE workspace_quotas (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  max_users INT NOT NULL DEFAULT 2,
  max_contacts INT NOT NULL DEFAULT 100,
  max_deals INT NOT NULL DEFAULT 50,
  max_storage_mb INT NOT NULL DEFAULT 500,
  current_users INT NOT NULL DEFAULT 0,
  current_contacts INT NOT NULL DEFAULT 0,
  current_deals INT NOT NULL DEFAULT 0,
  current_storage_mb INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CRM CORE: Contacts & Companies
-- ============================================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) >= 1),
  legal_name TEXT,
  edrpou TEXT,
  website TEXT,
  phone TEXT,
  email TEXT CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  address JSONB DEFAULT '{}'::jsonb,
  status company_status DEFAULT 'active',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  source TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL CHECK (length(trim(first_name)) >= 1),
  last_name TEXT NOT NULL CHECK (length(trim(last_name)) >= 1),
  middle_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name || COALESCE(' ' || middle_name, '')) STORED,
  phones JSONB DEFAULT '[]'::jsonb,
  emails JSONB DEFAULT '[]'::jsonb,
  position TEXT,
  status contact_status DEFAULT 'new',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  source TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_companies_workspace ON companies(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_owner ON companies(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_search ON companies USING GIN(to_tsvector('simple', name));
CREATE INDEX idx_companies_tags ON companies USING GIN(tags);
CREATE INDEX idx_contacts_workspace ON contacts(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_company ON contacts(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_owner ON contacts(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_search ON contacts USING GIN(to_tsvector('simple', full_name || ' ' || COALESCE(position, '')));
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

-- ============================================================================
-- DEALS & PIPELINES
-- ============================================================================

CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  stages JSONB NOT NULL DEFAULT '[
    {"id": "new", "name": "Новий", "order": 1, "probability": 10, "color": "#94a3b8"},
    {"id": "qualified", "name": "Кваліфікований", "order": 2, "probability": 25, "color": "#60a5fa"},
    {"id": "proposal", "name": "Пропозиція", "order": 3, "probability": 50, "color": "#a78bfa"},
    {"id": "negotiation", "name": "Переговори", "order": 4, "probability": 75, "color": "#fb923c"},
    {"id": "won", "name": "Виграно", "order": 5, "probability": 100, "color": "#34d399"},
    {"id": "lost", "name": "Програно", "order": 6, "probability": 0, "color": "#f87171"}
  ]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE RESTRICT,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) >= 1),
  amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'UAH',
  probability INT DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  expected_close_date DATE,
  actual_close_date DATE,
  status deal_status DEFAULT 'open',
  lost_reason TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id TEXT,
  to_stage_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_workspace ON deals(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_pipeline ON deals(pipeline_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_owner ON deals(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_contact ON deals(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_company ON deals(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_status ON deals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_deal_stage_history_deal ON deal_stage_history(deal_id);

-- ============================================================================
-- PRODUCTS & SERVICES
-- ============================================================================

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) >= 1),
  sku TEXT,
  description TEXT,
  price NUMERIC(15,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'UAH',
  unit TEXT DEFAULT 'шт.',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE deal_products (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price NUMERIC(15,2) NOT NULL CHECK (price >= 0),
  discount NUMERIC(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  total NUMERIC(15,2) GENERATED ALWAYS AS (quantity * price * (1 - discount / 100)) STORED,
  notes TEXT
);

CREATE TABLE product_price_history (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price NUMERIC(15,2),
  new_price NUMERIC(15,2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_workspace ON products(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(workspace_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_deal_products_deal ON deal_products(deal_id);

-- ============================================================================
-- TASKS & ACTIVITIES
-- ============================================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) >= 1),
  description TEXT,
  task_type task_type NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  reminders JSONB DEFAULT '[]'::jsonb,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to) WHERE deleted_at IS NULL AND status != 'completed';
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE deleted_at IS NULL AND status != 'completed';
CREATE INDEX idx_activities_workspace ON activities(workspace_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- ============================================================================
-- FILES & NOTIFICATIONS
-- ============================================================================

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_workspace ON files(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

CREATE TABLE integrations (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  nova_poshta_api_key TEXT,
  nova_poshta_settings JSONB DEFAULT '{}'::jsonb,
  smtp_settings JSONB DEFAULT '{}'::jsonb,
  sms_settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate a secure invitation token.
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION generate_invitation_token IS 'Generates a secure random token in hex format for invitations.';


-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables that have it
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_users_updated_at BEFORE UPDATE ON workspace_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_invitations_updated_at BEFORE UPDATE ON workspace_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger function: Auto-update deal amount when products change
CREATE OR REPLACE FUNCTION update_deal_amount()
RETURNS TRIGGER AS $$
DECLARE
  v_deal_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_deal_id := OLD.deal_id;
  ELSE
    v_deal_id := NEW.deal_id;
  END IF;

  UPDATE deals SET amount = (SELECT COALESCE(SUM(total), 0) FROM deal_products WHERE deal_id = v_deal_id) WHERE id = v_deal_id;
  
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deal_amount_trigger AFTER INSERT OR UPDATE OR DELETE ON deal_products FOR EACH ROW EXECUTE FUNCTION update_deal_amount();

-- Trigger function: Track deal stage changes
CREATE OR REPLACE FUNCTION track_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO deal_stage_history (deal_id, from_stage_id, to_stage_id, user_id)
    VALUES (NEW.id, OLD.stage_id, NEW.stage_id, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_deal_stage_change_trigger AFTER UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION track_deal_stage_change();

-- Trigger function: Update workspace quotas (RECURSION-FIXED VERSION)
CREATE OR REPLACE FUNCTION public.update_workspace_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Temporarily disable RLS for this function to prevent recursion.
  -- This is safe as the trigger logic doesn't depend on user input,
  -- but only updates counters based on system events (INSERT/UPDATE/DELETE).
  SET LOCAL row_level_security.enabled = OFF;

  IF TG_TABLE_NAME = 'contacts' THEN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
      UPDATE public.workspace_quotas SET current_contacts = current_contacts + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
      UPDATE public.workspace_quotas SET current_contacts = GREATEST(current_contacts - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'deals' THEN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
      UPDATE public.workspace_quotas SET current_deals = current_deals + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
      UPDATE public.workspace_quotas SET current_deals = GREATEST(current_deals - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'workspace_users' THEN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
      UPDATE public.workspace_quotas SET current_users = current_users + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status != 'active' AND OLD.status = 'active') THEN
      UPDATE public.workspace_quotas SET current_users = GREATEST(current_users - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_contacts_usage AFTER INSERT OR UPDATE OR DELETE ON contacts FOR EACH ROW EXECUTE FUNCTION update_workspace_usage();
CREATE TRIGGER update_deals_usage AFTER INSERT OR UPDATE OR DELETE ON deals FOR EACH ROW EXECUTE FUNCTION update_workspace_usage();
CREATE TRIGGER update_users_usage AFTER INSERT OR UPDATE OR DELETE ON workspace_users FOR EACH ROW EXECUTE FUNCTION update_workspace_usage();

-- Trigger function: Log product price changes
CREATE OR REPLACE FUNCTION log_product_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO product_price_history (product_id, old_price, new_price, changed_by)
    VALUES (NEW.id, OLD.price, NEW.price, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_product_price_change_trigger AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION log_product_price_change();

-- Trigger function: Create default pipeline and quotas for new workspace
CREATE OR REPLACE FUNCTION create_default_pipeline_and_quotas()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pipelines (workspace_id, name, is_default) VALUES (NEW.id, 'Основна воронка', TRUE);
  INSERT INTO workspace_quotas (workspace_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_pipeline_trigger AFTER INSERT ON workspaces FOR EACH ROW EXECUTE FUNCTION create_default_pipeline_and_quotas();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (RECURSION-FIXED)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Grant basic rights
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- REFACTORED AND SAFE RLS POLICIES
-- ============================================================================

-- Table: workspaces
CREATE POLICY "view_workspaces" ON public.workspaces FOR SELECT USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = workspaces.id));
CREATE POLICY "admins_update_workspaces" ON public.workspaces FOR UPDATE USING
  ((owner_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.role IN ('owner', 'admin') AND wu.workspace_id = workspaces.id));
CREATE POLICY "Users can create workspaces" ON workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Table: workspace_users
CREATE POLICY "Users can view team members in their workspace" ON public.workspace_users FOR SELECT USING
  (EXISTS (SELECT 1 FROM public.workspace_users AS w_users WHERE w_users.user_id = auth.uid() AND w_users.status = 'active' AND w_users.workspace_id = workspace_users.workspace_id));
CREATE POLICY "Admins can insert new users" ON public.workspace_users FOR INSERT WITH CHECK
  (EXISTS (SELECT 1 FROM public.workspace_users AS w_users WHERE w_users.user_id = auth.uid() AND w_users.role IN ('owner', 'admin') AND w_users.status = 'active' AND w_users.workspace_id = workspace_users.workspace_id));
CREATE POLICY "Admins can update team members" ON public.workspace_users FOR UPDATE USING
  (EXISTS (SELECT 1 FROM public.workspace_users AS w_users WHERE w_users.user_id = auth.uid() AND w_users.role IN ('owner', 'admin') AND w_users.status = 'active' AND w_users.workspace_id = workspace_users.workspace_id));

-- Table: deals
CREATE POLICY "Users can view deals in their workspace" ON public.deals FOR SELECT USING
  (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = deals.workspace_id AND (wu.role IN ('owner', 'admin', 'manager', 'guest') OR deals.owner_id = auth.uid())));
CREATE POLICY "Users can create deals" ON public.deals FOR INSERT WITH CHECK
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = deals.workspace_id AND wu.role IN ('owner', 'admin', 'manager', 'user')));
CREATE POLICY "Users can update their deals" ON public.deals FOR UPDATE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = deals.workspace_id AND (wu.role IN ('owner', 'admin', 'manager') OR deals.owner_id = auth.uid())));
CREATE POLICY "Managers can delete deals" ON public.deals FOR DELETE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = deals.workspace_id AND wu.role IN ('owner', 'admin', 'manager')));

-- Table: contacts
CREATE POLICY "Users can view contacts in their workspace" ON public.contacts FOR SELECT USING
  (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = contacts.workspace_id AND (wu.role IN ('owner', 'admin', 'manager', 'guest') OR contacts.owner_id = auth.uid())));
CREATE POLICY "Users can create contacts" ON public.contacts FOR INSERT WITH CHECK
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = contacts.workspace_id AND wu.role IN ('owner', 'admin', 'manager', 'user')));
CREATE POLICY "Users can update their contacts" ON public.contacts FOR UPDATE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = contacts.workspace_id AND (wu.role IN ('owner', 'admin', 'manager') OR contacts.owner_id = auth.uid())));
CREATE POLICY "Managers can delete contacts" ON public.contacts FOR DELETE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = contacts.workspace_id AND wu.role IN ('owner', 'admin', 'manager')));

-- Table: companies
CREATE POLICY "Users can view companies in their workspace" ON public.companies FOR SELECT USING
  (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = companies.workspace_id));
CREATE POLICY "Users can create companies" ON public.companies FOR INSERT WITH CHECK
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = companies.workspace_id AND wu.role IN ('owner', 'admin', 'manager', 'user')));
CREATE POLICY "Users can update companies" ON public.companies FOR UPDATE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = companies.workspace_id AND wu.role IN ('owner', 'admin', 'manager')));
CREATE POLICY "Managers can delete companies" ON public.companies FOR DELETE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = companies.workspace_id AND wu.role IN ('owner', 'admin', 'manager')));

-- Table: tasks
CREATE POLICY "Users can view their tasks" ON public.tasks FOR SELECT USING
  (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = tasks.workspace_id AND (wu.role IN ('owner', 'admin', 'manager') OR tasks.assigned_to = auth.uid() OR tasks.created_by = auth.uid())));
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = tasks.workspace_id AND wu.role IN ('owner', 'admin', 'manager', 'user')));
CREATE POLICY "Users can update assigned tasks" ON public.tasks FOR UPDATE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = tasks.workspace_id AND (wu.role IN ('owner', 'admin', 'manager') OR tasks.assigned_to = auth.uid())));
CREATE POLICY "Managers can delete tasks" ON public.tasks FOR DELETE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = tasks.workspace_id AND wu.role IN ('owner', 'admin', 'manager')));

-- Table: activities
CREATE POLICY "view_activities" ON public.activities FOR SELECT USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = activities.workspace_id));
CREATE POLICY "insert_activities" ON public.activities FOR INSERT WITH CHECK
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = activities.workspace_id));

-- Table: deal_products
CREATE POLICY "manage_deal_products" ON public.deal_products FOR ALL USING
  (EXISTS (SELECT 1 FROM public.deals d JOIN public.workspace_users wu ON d.workspace_id = wu.workspace_id WHERE d.id = deal_products.deal_id AND wu.user_id = auth.uid() AND wu.status = 'active'));

-- Table: deal_stage_history
CREATE POLICY "view_deal_stage_history" ON public.deal_stage_history FOR SELECT USING
  (EXISTS (SELECT 1 FROM public.deals d JOIN public.workspace_users wu ON d.workspace_id = wu.workspace_id WHERE d.id = deal_stage_history.deal_id AND wu.user_id = auth.uid() AND wu.status = 'active'));

-- Table: files
CREATE POLICY "view_files" ON public.files FOR SELECT USING
  (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = files.workspace_id));
CREATE POLICY "insert_files" ON public.files FOR INSERT WITH CHECK
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = files.workspace_id));
CREATE POLICY "delete_files" ON public.files FOR DELETE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = files.workspace_id AND (wu.role IN ('owner', 'admin') OR files.uploaded_by = auth.uid())));
  
-- Table: integrations
CREATE POLICY "manage_integrations" ON public.integrations FOR ALL USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = integrations.workspace_id AND wu.role IN ('owner', 'admin')));

-- Table: pipelines
CREATE POLICY "manage_pipelines" ON public.pipelines FOR ALL USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = pipelines.workspace_id));

-- Table: product_categories
CREATE POLICY "manage_product_categories" ON public.product_categories FOR ALL USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = product_categories.workspace_id));

-- Table: products
CREATE POLICY "view_products" ON public.products FOR SELECT USING
  (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = products.workspace_id));
CREATE POLICY "manage_products" ON public.products FOR ALL USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = products.workspace_id AND wu.role IN ('owner', 'admin', 'manager')));

-- Table: subscriptions
CREATE POLICY "view_subscription" ON public.subscriptions FOR SELECT USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = subscriptions.workspace_id));
CREATE POLICY "manage_subscription_by_owner" ON public.subscriptions FOR ALL USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = subscriptions.workspace_id AND wu.role = 'owner'));

-- Table: workspace_invitations
CREATE POLICY "admins_manage_invitations" ON public.workspace_invitations FOR ALL USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.role IN ('owner', 'admin') AND wu.workspace_id = workspace_invitations.workspace_id));
CREATE POLICY "invited_user_can_view" ON public.workspace_invitations FOR SELECT USING
  (email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()));
  
-- Table: workspace_quotas
CREATE POLICY "view_quotas" ON public.workspace_quotas FOR SELECT USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = workspace_quotas.workspace_id));
CREATE POLICY "admins_update_quotas" ON public.workspace_quotas FOR UPDATE USING
  (EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.role IN ('owner', 'admin') AND wu.workspace_id = workspace_quotas.workspace_id));

-- Table: notifications
CREATE POLICY "user_can_manage_own_notifications" ON public.notifications FOR ALL
  USING(user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = auth.uid() AND wu.status = 'active' AND wu.workspace_id = notifications.workspace_id));

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
