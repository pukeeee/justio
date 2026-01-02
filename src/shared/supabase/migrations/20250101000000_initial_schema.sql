-- ============================================================================
-- CRM4SMB Database Schema
-- Version: 1.0.0
-- Description: Complete database schema with RLS, triggers, and functions
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

-- ============================================================================
-- CORE TABLES: Organizations & Users
-- ============================================================================

-- Workspaces (Organizations)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND length(slug) >= 2),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Settings stored as JSONB for flexibility
  settings JSONB DEFAULT '{
    "visibility_mode": "all",
    "default_currency": "UAH",
    "timezone": "Europe/Kyiv",
    "date_format": "DD.MM.YYYY"
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT workspace_name_not_empty CHECK (trim(name) != '')
);

-- Workspace users (many-to-many with roles)
CREATE TABLE workspace_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  status workspace_user_status NOT NULL DEFAULT 'active',
  
  -- Invitation tracking
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_workspace_user UNIQUE(workspace_id, user_id)
);

-- Create index for faster user workspace lookups
CREATE INDEX idx_workspace_users_user_id ON workspace_users(user_id);
CREATE INDEX idx_workspace_users_workspace_id ON workspace_users(workspace_id);

-- ============================================================================
-- BILLING & SUBSCRIPTIONS
-- ============================================================================

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'trialing',
  
  -- Billing information
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  cancelled_at TIMESTAMPTZ,
  
  -- External payment provider data
  payment_provider TEXT CHECK (payment_provider IN ('paddle', 'fondy', 'stripe')),
  external_subscription_id TEXT,
  
  -- Enabled add-on modules
  enabled_modules TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_workspace_subscription UNIQUE(workspace_id)
);

-- Payments history
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Payment details
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'UAH',
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- External provider information
  payment_provider TEXT NOT NULL,
  external_payment_id TEXT,
  invoice_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_workspace ON payments(workspace_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);

-- Workspace quotas for tier limits
CREATE TABLE workspace_quotas (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Limits based on tier
  max_users INT NOT NULL DEFAULT 2,
  max_contacts INT NOT NULL DEFAULT 100,
  max_deals INT NOT NULL DEFAULT 50,
  max_storage_mb INT NOT NULL DEFAULT 500,
  
  -- Current usage
  current_users INT NOT NULL DEFAULT 0,
  current_contacts INT NOT NULL DEFAULT 0,
  current_deals INT NOT NULL DEFAULT 0,
  current_storage_mb INT NOT NULL DEFAULT 0,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CRM CORE: Contacts & Companies
-- ============================================================================

-- Companies (legal entities)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Basic information
  name TEXT NOT NULL CHECK (length(trim(name)) >= 1),
  legal_name TEXT,
  edrpou TEXT, -- Ukrainian tax ID
  website TEXT,
  
  -- Contact information
  phone TEXT,
  email TEXT CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  address JSONB DEFAULT '{}'::jsonb,
  
  -- CRM fields
  status company_status DEFAULT 'active',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  source TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Custom fields (flexible JSONB)
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Contacts (individuals)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Personal information
  first_name TEXT NOT NULL CHECK (length(trim(first_name)) >= 1),
  last_name TEXT NOT NULL CHECK (length(trim(last_name)) >= 1),
  middle_name TEXT,
  
  -- Full name computed column for search
  full_name TEXT GENERATED ALWAYS AS (
    first_name || ' ' || last_name || COALESCE(' ' || middle_name, '')
  ) STORED,
  
  -- Contact information (stored as JSONB arrays for flexibility)
  phones JSONB DEFAULT '[]'::jsonb, -- [{type: 'mobile', number: '+380...', primary: true}]
  emails JSONB DEFAULT '[]'::jsonb, -- [{type: 'work', email: '...', primary: true}]
  
  -- Job information
  position TEXT,
  
  -- CRM fields
  status contact_status DEFAULT 'new',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  source TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Custom fields
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for contacts and companies
CREATE INDEX idx_companies_workspace ON companies(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_owner ON companies(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_search ON companies USING GIN(to_tsvector('simple', name));
CREATE INDEX idx_companies_tags ON companies USING GIN(tags);

CREATE INDEX idx_contacts_workspace ON contacts(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_company ON contacts(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_owner ON contacts(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_search ON contacts USING GIN(
  to_tsvector('simple', full_name || ' ' || COALESCE(position, ''))
);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

-- ============================================================================
-- DEALS & PIPELINES
-- ============================================================================

-- Pipelines (sales funnels)
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Stages stored as JSONB array
  -- [{id: 'uuid', name: 'New', order: 1, probability: 10, color: '#blue'}]
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

-- Deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE RESTRICT,
  stage_id TEXT NOT NULL, -- References stage.id in pipeline.stages
  
  -- Basic information
  title TEXT NOT NULL CHECK (length(trim(title)) >= 1),
  amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'UAH',
  probability INT DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  
  -- Relationships
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Dates
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Status and outcome
  status deal_status DEFAULT 'open',
  lost_reason TEXT,
  
  -- Additional data
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Deal stage history for analytics
CREATE TABLE deal_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id TEXT,
  to_stage_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for deals
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

-- Product categories (hierarchical)
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products and services
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  
  -- Product information
  name TEXT NOT NULL CHECK (length(trim(name)) >= 1),
  sku TEXT,
  description TEXT,
  
  -- Pricing
  price NUMERIC(15,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'UAH',
  unit TEXT DEFAULT 'шт.',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Deal products (line items)
CREATE TABLE deal_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Line item details
  name TEXT NOT NULL, -- Snapshot of product name
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price NUMERIC(15,2) NOT NULL CHECK (price >= 0),
  discount NUMERIC(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  
  -- Computed total
  total NUMERIC(15,2) GENERATED ALWAYS AS (quantity * price * (1 - discount / 100)) STORED,
  
  notes TEXT
);

-- Product price history for audit trail
CREATE TABLE product_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price NUMERIC(15,2),
  new_price NUMERIC(15,2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_workspace ON products(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(workspace_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_deal_products_deal ON deal_products(deal_id);

-- ============================================================================
-- TASKS & ACTIVITIES
-- ============================================================================

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL CHECK (length(trim(title)) >= 1),
  description TEXT,
  task_type task_type NOT NULL,
  
  -- Assignment
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Status
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  
  -- Timing
  due_date TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Reminders stored as JSONB
  reminders JSONB DEFAULT '[]'::jsonb,
  
  -- Relationships
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  
  -- Result
  result TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Activities (timeline/history)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type activity_type NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Relationships (optional)
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- User who performed the action
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for tasks and activities
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

-- Files and attachments
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- File information
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  
  -- Relationships (optional)
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_files_workspace ON files(workspace_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

-- Integration settings (encrypted sensitive data)
CREATE TABLE integrations (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Nova Poshta
  nova_poshta_api_key TEXT,
  nova_poshta_settings JSONB DEFAULT '{}'::jsonb,
  
  -- SMTP settings (encrypted)
  smtp_settings JSONB DEFAULT '{}'::jsonb,
  
  -- SMS provider settings
  sms_settings JSONB DEFAULT '{}'::jsonb,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's workspace_id
CREATE OR REPLACE FUNCTION get_current_workspace_id()
RETURNS UUID AS $$
  SELECT workspace_id 
  FROM workspace_users 
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to get current user's role in workspace
CREATE OR REPLACE FUNCTION get_current_user_role(p_workspace_id UUID DEFAULT NULL)
RETURNS user_role AS $$
  SELECT role 
  FROM workspace_users 
  WHERE user_id = auth.uid()
    AND workspace_id = COALESCE(p_workspace_id, get_current_workspace_id())
    AND status = 'active'
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;



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

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_workspace_users_updated_at BEFORE UPDATE ON workspace_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger function: Auto-update deal amount when products change
CREATE OR REPLACE FUNCTION update_deal_amount()
RETURNS TRIGGER AS $$
DECLARE
  v_deal_id UUID;
BEGIN
  -- Get deal_id from INSERT/UPDATE or DELETE
  IF TG_OP = 'DELETE' THEN
    v_deal_id := OLD.deal_id;
  ELSE
    v_deal_id := NEW.deal_id;
  END IF;

  -- Update deal amount
  UPDATE deals 
  SET amount = (
    SELECT COALESCE(SUM(total), 0) 
    FROM deal_products 
    WHERE deal_id = v_deal_id
  )
  WHERE id = v_deal_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deal_amount_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON deal_products
  FOR EACH ROW EXECUTE FUNCTION update_deal_amount();

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

CREATE TRIGGER track_deal_stage_change_trigger
  AFTER UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION track_deal_stage_change();

-- Trigger function: Update workspace quotas
CREATE OR REPLACE FUNCTION update_workspace_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'contacts' THEN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
      UPDATE workspace_quotas 
      SET current_contacts = current_contacts + 1,
          updated_at = NOW()
      WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
      UPDATE workspace_quotas 
      SET current_contacts = GREATEST(current_contacts - 1, 0),
          updated_at = NOW()
      WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'deals' THEN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
      UPDATE workspace_quotas 
      SET current_deals = current_deals + 1,
          updated_at = NOW()
      WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
      UPDATE workspace_quotas 
      SET current_deals = GREATEST(current_deals - 1, 0),
          updated_at = NOW()
      WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'workspace_users' THEN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
      UPDATE workspace_quotas 
      SET current_users = current_users + 1,
          updated_at = NOW()
      WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status != 'active' AND OLD.status = 'active') THEN
      UPDATE workspace_quotas 
      SET current_users = GREATEST(current_users - 1, 0),
          updated_at = NOW()
      WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contacts_usage AFTER INSERT OR UPDATE OR DELETE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_workspace_usage();
  
CREATE TRIGGER update_deals_usage AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_workspace_usage();
  
CREATE TRIGGER update_users_usage AFTER INSERT OR UPDATE OR DELETE ON workspace_users
  FOR EACH ROW EXECUTE FUNCTION update_workspace_usage();

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

CREATE TRIGGER log_product_price_change_trigger
  AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION log_product_price_change();

-- Trigger function: Create default pipeline for new workspace
CREATE OR REPLACE FUNCTION create_default_pipeline()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pipelines (workspace_id, name, is_default)
  VALUES (NEW.id, 'Основна воронка', TRUE);
  
  INSERT INTO workspace_quotas (workspace_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_pipeline_trigger
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION create_default_pipeline();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
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

-- Workspaces: Users can only see workspaces they belong to
CREATE POLICY "Users can view their workspaces"
ON workspaces FOR SELECT
USING (
  id IN (
    SELECT workspace_id FROM workspace_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can create workspaces"
ON workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their workspaces"
ON workspaces FOR UPDATE
USING (
  owner_id = auth.uid() OR
  id IN (
    SELECT workspace_id FROM workspace_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
  )
);

-- Workspace Users: Only admins can manage team members
CREATE POLICY "Users can view team members in their workspace"
ON workspace_users FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Admins can invite users"
ON workspace_users FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
  )
);

CREATE POLICY "Admins can update team members"
ON workspace_users FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
  )
);

-- Contacts: Role-based access
CREATE POLICY "Users can view contacts in their workspace"
ON contacts FOR SELECT
USING (
  workspace_id = get_current_workspace_id() AND
  deleted_at IS NULL AND
  (
    -- Admins, Managers, and Guests see all
    get_current_user_role() IN ('owner', 'admin', 'manager', 'guest') OR
    -- Users see only their own
    owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create contacts"
ON contacts FOR INSERT
WITH CHECK (
  workspace_id = get_current_workspace_id() AND
  get_current_user_role() IN ('owner', 'admin', 'manager', 'user')
);

CREATE POLICY "Users can update their contacts"
ON contacts FOR UPDATE
USING (
  workspace_id = get_current_workspace_id() AND
  (
    get_current_user_role() IN ('owner', 'admin', 'manager') OR
    owner_id = auth.uid()
  )
);

CREATE POLICY "Managers can delete contacts"
ON contacts FOR DELETE
USING (
  workspace_id = get_current_workspace_id() AND
  get_current_user_role() IN ('owner', 'admin', 'manager')
);

-- Companies: Similar to contacts
CREATE POLICY "Users can view companies in their workspace"
ON companies FOR SELECT
USING (
  workspace_id = get_current_workspace_id() AND
  deleted_at IS NULL
);

CREATE POLICY "Users can create companies"
ON companies FOR INSERT
WITH CHECK (
  workspace_id = get_current_workspace_id() AND
  get_current_user_role() IN ('owner', 'admin', 'manager', 'user')
);

CREATE POLICY "Users can update companies"
ON companies FOR UPDATE
USING (
  workspace_id = get_current_workspace_id() AND
  get_current_user_role() IN ('owner', 'admin', 'manager')
);

-- Deals: Role-based access
CREATE POLICY "Users can view deals in their workspace"
ON deals FOR SELECT
USING (
  workspace_id = get_current_workspace_id() AND
  deleted_at IS NULL AND
  (
    get_current_user_role() IN ('owner', 'admin', 'manager', 'guest') OR
    owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create deals"
ON deals FOR INSERT
WITH CHECK (
  workspace_id = get_current_workspace_id() AND
  get_current_user_role() IN ('owner', 'admin', 'manager', 'user')
);

CREATE POLICY "Users can update their deals"
ON deals FOR UPDATE
USING (
  workspace_id = get_current_workspace_id() AND
  (
    get_current_user_role() IN ('owner', 'admin', 'manager') OR
    owner_id = auth.uid()
  )
);

-- Tasks: Users can see tasks assigned to them
CREATE POLICY "Users can view their tasks"
ON tasks FOR SELECT
USING (
  workspace_id = get_current_workspace_id() AND
  deleted_at IS NULL AND
  (
    get_current_user_role() IN ('owner', 'admin', 'manager') OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  )
);

CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
WITH CHECK (
  workspace_id = get_current_workspace_id() AND
  get_current_user_role() IN ('owner', 'admin', 'manager', 'user')
);

CREATE POLICY "Users can update assigned tasks"
ON tasks FOR UPDATE
USING (
  workspace_id = get_current_workspace_id() AND
  (
    get_current_user_role() IN ('owner', 'admin', 'manager') OR
    assigned_to = auth.uid()
  )
);

-- Products: Managers can CRUD
CREATE POLICY "Users can view products"
ON products FOR SELECT
USING (workspace_id = get_current_workspace_id() AND deleted_at IS NULL);

CREATE POLICY "Managers can manage products"
ON products FOR ALL
USING (
  workspace_id = get_current_workspace_id() AND
  get_current_user_role() IN ('owner', 'admin', 'manager')
);

-- Activities: Read-only for most, created by system
CREATE POLICY "Users can view activities"
ON activities FOR SELECT
USING (workspace_id = get_current_workspace_id());

CREATE POLICY "System can create activities"
ON activities FOR INSERT
WITH CHECK (workspace_id = get_current_workspace_id());

-- Subscriptions: Only owners can manage
CREATE POLICY "Users can view their subscription"
ON subscriptions FOR SELECT
USING (workspace_id = get_current_workspace_id());

CREATE POLICY "Owners can manage subscriptions"
ON subscriptions FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_users 
    WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
  )
);

-- Notifications: Users see only their own
CREATE POLICY "Users can view their notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- Files: Users in workspace can view, creators can delete
CREATE POLICY "Users can view files in workspace"
ON files FOR SELECT
USING (workspace_id = get_current_workspace_id() AND deleted_at IS NULL);

CREATE POLICY "Users can upload files"
ON files FOR INSERT
WITH CHECK (workspace_id = get_current_workspace_id());

-- Additional policies for related tables (pipelines, deal_products, etc.)
CREATE POLICY "workspace_policy" ON pipelines FOR ALL
USING (workspace_id = get_current_workspace_id());

CREATE POLICY "workspace_policy" ON deal_products FOR ALL
USING (deal_id IN (SELECT id FROM deals WHERE workspace_id = get_current_workspace_id()));

CREATE POLICY "workspace_policy" ON product_categories FOR ALL
USING (workspace_id = get_current_workspace_id());

CREATE POLICY "workspace_policy" ON workspace_quotas FOR SELECT
USING (workspace_id = get_current_workspace_id());

CREATE POLICY "workspace_policy" ON integrations FOR ALL
USING (workspace_id = get_current_workspace_id());

CREATE POLICY "workspace_policy" ON deal_stage_history FOR SELECT
USING (deal_id IN (SELECT id FROM deals WHERE workspace_id = get_current_workspace_id()));

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default subscription tiers configuration (for reference)
COMMENT ON TYPE subscription_tier IS 'Subscription tiers: free (2 users, 100 contacts), starter (5 users, 5000 contacts), pro (20 users, 50000 contacts), enterprise (unlimited)';

-- ============================================================================
-- GRANTS (if needed for specific use cases)
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
