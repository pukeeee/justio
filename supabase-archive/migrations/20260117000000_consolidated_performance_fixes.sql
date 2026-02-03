-- ============================================================================
-- Migration: Комплексне виправлення проблем продуктивності
-- Date: 2026-01-17
-- Description: Виправляє всі зауваження щодо продуктивності зі звіту Supabase:
-- 1. Консолідує дублюючі політики RLS для усунення `multiple_permissive_policies`.
-- 2. Гарантує, що всі політики використовують `(select auth.uid())` для оптимізації `auth_rls_initplan`.
-- 3. Створює відсутні індекси для зовнішніх ключів для виправлення `unindexed_foreign_keys`.
-- 4. Видаляє невикористовувані індекси згідно зі звітом `unused_index`.
-- ============================================================================

-- ============================================================================
-- ЧАСТИНА 1: Консолідація та оптимізація політик RLS (`multiple_permissive_policies`)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Таблиця: activities
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow members to view workspace activities" ON public.activities;
DROP POLICY IF EXISTS "Users can view activities in their workspace" ON public.activities;
CREATE POLICY "Consolidated: Users can view activities" ON public.activities FOR SELECT USING (
  public.is_workspace_member(workspace_id, (select auth.uid()))
);

-- ----------------------------------------------------------------------------
-- Таблиця: contacts
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view contacts based on role and visibility_mode" ON public.contacts;
DROP POLICY IF EXISTS "Users can view contacts based on their role" ON public.contacts;
CREATE POLICY "Consolidated: Users can view contacts" ON public.contacts FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_users wu
    JOIN public.workspaces w ON wu.workspace_id = w.id
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = contacts.workspace_id
      AND (
        wu.role IN ('owner', 'admin', 'manager', 'guest')
        OR
        (wu.role = 'user' AND w.settings->>'visibility_mode' = 'all')
        OR
        (
          wu.role = 'user'
          AND COALESCE(w.settings->>'visibility_mode', 'own') = 'own'
          AND contacts.owner_id = (select auth.uid())
        )
      )
  )
);

-- ----------------------------------------------------------------------------
-- Таблиця: products
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "manage_products" ON public.products;
DROP POLICY IF EXISTS "view_products" ON public.products;
DROP POLICY IF EXISTS "manage_products_insert" ON public.products;
DROP POLICY IF EXISTS "manage_products_update" ON public.products;
DROP POLICY IF EXISTS "manage_products_delete" ON public.products;


CREATE POLICY "view_products" ON public.products FOR SELECT USING (
  deleted_at IS NULL AND EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = products.workspace_id
  )
);

CREATE POLICY "manage_products_insert" ON public.products FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = products.workspace_id
      AND wu.role IN ('owner', 'admin', 'manager')
  )
);

CREATE POLICY "manage_products_update" ON public.products FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = products.workspace_id
      AND wu.role IN ('owner', 'admin', 'manager')
  )
);

CREATE POLICY "manage_products_delete" ON public.products FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = products.workspace_id
      AND wu.role IN ('owner', 'admin', 'manager')
  )
);

-- ----------------------------------------------------------------------------
-- Таблиця: subscriptions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "manage_subscription_by_owner" ON public.subscriptions;
DROP POLICY IF EXISTS "view_subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "manage_subscription_by_owner_insert" ON public.subscriptions;
DROP POLICY IF EXISTS "manage_subscription_by_owner_update" ON public.subscriptions;
DROP POLICY IF EXISTS "manage_subscription_by_owner_delete" ON public.subscriptions;

CREATE POLICY "view_subscription" ON public.subscriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = subscriptions.workspace_id
  )
);

CREATE POLICY "manage_subscription_by_owner_insert" ON public.subscriptions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = subscriptions.workspace_id
      AND wu.role = 'owner'
  )
);

CREATE POLICY "manage_subscription_by_owner_update" ON public.subscriptions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = subscriptions.workspace_id
      AND wu.role = 'owner'
  )
);

CREATE POLICY "manage_subscription_by_owner_delete" ON public.subscriptions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = subscriptions.workspace_id
      AND wu.role = 'owner'
  )
);

-- ----------------------------------------------------------------------------
-- Таблиця: workspace_invitations
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "admins_manage_invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "invited_user_can_view" ON public.workspace_invitations;
DROP POLICY IF EXISTS "admins_manage_invitations_insert" ON public.workspace_invitations;
DROP POLICY IF EXISTS "admins_manage_invitations_update" ON public.workspace_invitations;
DROP POLICY IF EXISTS "admins_manage_invitations_delete" ON public.workspace_invitations;

CREATE POLICY "Consolidated: Users can view invitations" ON public.workspace_invitations FOR SELECT USING (
  (EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.role IN ('owner', 'admin')
      AND wu.workspace_id = workspace_invitations.workspace_id
  ))
  OR
  (email = (SELECT u.email FROM auth.users u WHERE u.id = (select auth.uid())))
);

CREATE POLICY "admins_manage_invitations_insert" ON public.workspace_invitations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.role IN ('owner', 'admin')
      AND wu.workspace_id = workspace_invitations.workspace_id
  )
);

CREATE POLICY "admins_manage_invitations_update" ON public.workspace_invitations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.role IN ('owner', 'admin')
      AND wu.workspace_id = workspace_invitations.workspace_id
  )
);

CREATE POLICY "admins_manage_invitations_delete" ON public.workspace_invitations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.role IN ('owner', 'admin')
      AND wu.workspace_id = workspace_invitations.workspace_id
  )
);


-- ============================================================================
-- ЧАСТИНА 2: Створення відсутніх індексів для зовнішніх ключів (`unindexed_foreign_keys`)
-- ============================================================================

-- activities
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON public.activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON public.activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON public.activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_task_id ON public.activities(task_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);

-- companies
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);

-- contacts
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON public.contacts(created_by);

-- deal_products
CREATE INDEX IF NOT EXISTS idx_deal_products_product_id ON public.deal_products(product_id);

-- deal_stage_history
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_user_id ON public.deal_stage_history(user_id);

-- deals
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON public.deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_created_by ON public.deals(created_by);

-- files
CREATE INDEX IF NOT EXISTS idx_files_company_id ON public.files(company_id);
CREATE INDEX IF NOT EXISTS idx_files_contact_id ON public.files(contact_id);
CREATE INDEX IF NOT EXISTS idx_files_deal_id ON public.files(deal_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON public.files(uploaded_by);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_workspace_id ON public.notifications(workspace_id);

-- pipelines
CREATE INDEX IF NOT EXISTS idx_pipelines_workspace_id ON public.pipelines(workspace_id);

-- product_categories
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_workspace_id ON public.product_categories(workspace_id);

-- product_price_history
CREATE INDEX IF NOT EXISTS idx_product_price_history_changed_by ON public.product_price_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_product_price_history_product_id ON public.product_price_history(product_id);

-- products
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- tasks
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON public.tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON public.tasks(deal_id);

-- workspace_invitations
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_invited_by ON public.workspace_invitations(invited_by);

-- workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);


-- ============================================================================
-- ЧАСТИНА 3: Видалення невикористовуваних індексів (`unused_index`)
-- ============================================================================

DROP INDEX IF EXISTS public.idx_invitations_email;
DROP INDEX IF EXISTS public.idx_invitations_token;
DROP INDEX IF EXISTS public.idx_invitations_status;
DROP INDEX IF EXISTS public.idx_deals_workspace_status;
DROP INDEX IF EXISTS public.idx_products_workspace_active;
DROP INDEX IF EXISTS public.idx_companies_search;
DROP INDEX IF EXISTS public.idx_companies_tags;
DROP INDEX IF EXISTS public.idx_contacts_owner;
DROP INDEX IF EXISTS public.idx_contacts_search;
DROP INDEX IF EXISTS public.idx_contacts_tags;
DROP INDEX IF EXISTS public.idx_tasks_assigned_status;
DROP INDEX IF EXISTS public.idx_activities_workspace_recent;
DROP INDEX IF EXISTS public.idx_files_workspace_active;
DROP INDEX IF EXISTS public.idx_deals_workspace;
DROP INDEX IF EXISTS public.idx_deals_pipeline;
DROP INDEX IF EXISTS public.idx_deals_owner;

-- ============================================================================
-- КІНЕЦЬ МІГРАЦІЇ
-- ============================================================================
