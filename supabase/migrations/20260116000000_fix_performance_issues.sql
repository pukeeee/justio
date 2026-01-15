-- ============================================================================
-- Migration: Комплексное исправление проблем производительности
-- Date: 2026-01-16
-- Description: Исправляет все предупреждения Supabase о производительности:
-- 1. Оптимизация RLS политик (замена auth.uid() на (select auth.uid()))
-- 2. Удаление неиспользуемых индексов
-- ============================================================================

-- ============================================================================
-- ЧАСТЬ 1: ОПТИМИЗАЦИЯ RLS ПОЛИТИК
-- Проблема: auth.uid() пересчитывается для каждой строки
-- Решение: (select auth.uid()) вычисляется один раз и кэшируется
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: workspaces
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "view_workspaces" ON public.workspaces;
CREATE POLICY "view_workspaces" ON public.workspaces FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = workspaces.id
  )
);

DROP POLICY IF EXISTS "admins_update_workspaces" ON public.workspaces;
CREATE POLICY "admins_update_workspaces" ON public.workspaces FOR UPDATE USING (
  (owner_id = (select auth.uid())) 
  OR 
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.role IN ('owner', 'admin') 
      AND wu.workspace_id = workspaces.id
  )
);

DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT 
WITH CHECK (owner_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- Table: workspace_users
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view team members in their workspace" ON public.workspace_users;
CREATE POLICY "Users can view team members in their workspace" ON public.workspace_users FOR SELECT USING (
  public.is_workspace_member(workspace_id, (select auth.uid()))
);

DROP POLICY IF EXISTS "Admins can insert new users" ON public.workspace_users;
CREATE POLICY "Admins can insert new users" ON public.workspace_users FOR INSERT WITH CHECK (
  public.get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin')
);

DROP POLICY IF EXISTS "Admins or self can update team members" ON public.workspace_users;
CREATE POLICY "Admins or self can update team members" ON public.workspace_users FOR UPDATE USING (
  (public.get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin')) 
  OR 
  (user_id = (select auth.uid()))
);

DROP POLICY IF EXISTS "Admins can remove users, or users can remove themselves" ON public.workspace_users;
CREATE POLICY "Admins can remove users, or users can remove themselves" ON public.workspace_users FOR DELETE USING (
  (public.get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin')) 
  OR 
  (user_id = (select auth.uid()))
);

-- ----------------------------------------------------------------------------
-- Table: contacts
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view contacts based on role and visibility_mode" ON public.contacts;
CREATE POLICY "Users can view contacts based on role and visibility_mode" ON public.contacts FOR SELECT USING (
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

DROP POLICY IF EXISTS "Users can update contacts based on their role" ON public.contacts;
CREATE POLICY "Users can update contacts based on their role" ON public.contacts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = contacts.workspace_id
      AND (
        wu.role IN ('owner', 'admin', 'manager')
        OR
        (wu.role = 'user' AND contacts.owner_id = (select auth.uid()))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = contacts.workspace_id
      AND (
        wu.role IN ('owner', 'admin', 'manager')
        OR
        (wu.role = 'user' AND contacts.owner_id = (select auth.uid()) AND contacts.deleted_at IS NULL)
      )
  )
);

DROP POLICY IF EXISTS "Users can create contacts" ON public.contacts;
CREATE POLICY "Users can create contacts" ON public.contacts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = contacts.workspace_id 
      AND wu.role IN ('owner', 'admin', 'manager', 'user')
  )
);

DROP POLICY IF EXISTS "Managers can delete contacts" ON public.contacts;
CREATE POLICY "Managers can delete contacts" ON public.contacts FOR DELETE USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = contacts.workspace_id 
      AND wu.role IN ('owner', 'admin', 'manager')
  )
);

-- ----------------------------------------------------------------------------
-- Table: companies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view companies in their workspace" ON public.companies;
CREATE POLICY "Users can view companies in their workspace" ON public.companies FOR SELECT USING (
  public.is_workspace_member(workspace_id, (select auth.uid()))
);

DROP POLICY IF EXISTS "Users can update their or managed companies" ON public.companies;
CREATE POLICY "Users can update their or managed companies" ON public.companies FOR UPDATE
USING (
  deleted_at IS NULL
  AND
  EXISTS (
    SELECT 1
    FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = companies.workspace_id
      AND (
        wu.role IN ('owner', 'admin', 'manager')
        OR
        (wu.role = 'user' AND companies.created_by = (select auth.uid()))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = companies.workspace_id
      AND (
        wu.role IN ('owner', 'admin', 'manager')
        OR
        (wu.role = 'user' AND companies.created_by = (select auth.uid()) AND companies.deleted_at IS NULL)
      )
  )
);

DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
CREATE POLICY "Users can create companies" ON public.companies FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = companies.workspace_id 
      AND wu.role IN ('owner', 'admin', 'manager', 'user')
  )
);

DROP POLICY IF EXISTS "Managers can delete companies" ON public.companies;
CREATE POLICY "Managers can delete companies" ON public.companies FOR DELETE USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = companies.workspace_id 
      AND wu.role IN ('owner', 'admin', 'manager')
  )
);

-- ----------------------------------------------------------------------------
-- Table: deals
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view deals in their workspace" ON public.deals;
CREATE POLICY "Users can view deals in their workspace" ON public.deals FOR SELECT USING (
  public.is_workspace_member(workspace_id, (select auth.uid()))
);

DROP POLICY IF EXISTS "Users can create deals" ON public.deals;
CREATE POLICY "Users can create deals" ON public.deals FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = deals.workspace_id 
      AND wu.role IN ('owner', 'admin', 'manager', 'user')
  )
);

DROP POLICY IF EXISTS "Users can update their deals" ON public.deals;
CREATE POLICY "Users can update their deals" ON public.deals FOR UPDATE
USING (
  deleted_at IS NULL 
  AND (
    (public.get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin', 'manager')) 
    OR 
    deals.owner_id = (select auth.uid())
  )
)
WITH CHECK (
  (public.get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin', 'manager')) 
  OR 
  deals.owner_id = (select auth.uid())
);

DROP POLICY IF EXISTS "Managers can delete deals" ON public.deals;
CREATE POLICY "Managers can delete deals" ON public.deals FOR DELETE USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = deals.workspace_id 
      AND wu.role IN ('owner', 'admin', 'manager')
  )
);

-- ----------------------------------------------------------------------------
-- Table: tasks
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view their tasks" ON public.tasks;
CREATE POLICY "Users can view their tasks" ON public.tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu
    WHERE wu.user_id = (select auth.uid())
      AND wu.status = 'active'
      AND wu.workspace_id = tasks.workspace_id
      AND (
        wu.role IN ('owner', 'admin', 'manager') 
        OR 
        tasks.assigned_to = (select auth.uid()) 
        OR 
        tasks.created_by = (select auth.uid())
      )
  )
);

DROP POLICY IF EXISTS "Users can insert tasks for workspace members" ON public.tasks;
CREATE POLICY "Users can insert tasks for workspace members" ON public.tasks FOR INSERT WITH CHECK (
  created_by = (select auth.uid())
  AND
  (get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin', 'manager', 'user'))
  AND
  (get_workspace_role(assigned_to, workspace_id) IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can update their or managed tasks" ON public.tasks;
CREATE POLICY "Users can update their or managed tasks" ON public.tasks FOR UPDATE
USING (
  deleted_at IS NULL 
  AND (
    (get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin', 'manager'))
    OR
    (assigned_to = (select auth.uid()))
  )
)
WITH CHECK (
  (get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin', 'manager'))
  OR
  (assigned_to = (select auth.uid()) AND deleted_at IS NULL)
);

DROP POLICY IF EXISTS "Managers and owners can hard-delete tasks" ON public.tasks;
CREATE POLICY "Managers and owners can hard-delete tasks" ON public.tasks FOR DELETE USING (
  get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin', 'manager')
);

-- ----------------------------------------------------------------------------
-- Table: activities
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view activities in their workspace" ON public.activities;
CREATE POLICY "Users can view activities in their workspace" ON public.activities FOR SELECT USING (
  public.is_workspace_member(workspace_id, (select auth.uid()))
);

DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;
CREATE POLICY "Users can insert their own activities" ON public.activities FOR INSERT WITH CHECK (
  (public.get_workspace_role((select auth.uid()), workspace_id) IS NOT NULL 
   AND public.get_workspace_role((select auth.uid()), workspace_id) <> 'guest') 
  AND 
  (user_id = (select auth.uid()))
);

DROP POLICY IF EXISTS "Users can update their own notes, managers can update any" ON public.activities;
CREATE POLICY "Users can update their own notes, managers can update any" ON public.activities FOR UPDATE USING (
  (activity_type = 'note') 
  AND (
    (user_id = (select auth.uid()))
    OR
    (public.get_workspace_role((select auth.uid()), workspace_id) IN ('manager', 'owner', 'admin'))
  )
);

DROP POLICY IF EXISTS "Users can delete their own notes, managers can delete any" ON public.activities;
CREATE POLICY "Users can delete their own notes, managers can delete any" ON public.activities FOR DELETE USING (
  (activity_type = 'note') 
  AND (
    (user_id = (select auth.uid()))
    OR
    (public.get_workspace_role((select auth.uid()), workspace_id) IN ('manager', 'owner', 'admin'))
  )
);

-- ----------------------------------------------------------------------------
-- Table: deal_products
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "manage_deal_products" ON public.deal_products;
CREATE POLICY "manage_deal_products" ON public.deal_products FOR ALL USING (
  EXISTS (
    SELECT 1 
    FROM public.deals d 
    JOIN public.workspace_users wu ON d.workspace_id = wu.workspace_id 
    WHERE d.id = deal_products.deal_id 
      AND wu.user_id = (select auth.uid()) 
      AND wu.status = 'active'
  )
);

-- ----------------------------------------------------------------------------
-- Table: deal_stage_history
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "view_deal_stage_history" ON public.deal_stage_history;
CREATE POLICY "view_deal_stage_history" ON public.deal_stage_history FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.deals d 
    JOIN public.workspace_users wu ON d.workspace_id = wu.workspace_id 
    WHERE d.id = deal_stage_history.deal_id 
      AND wu.user_id = (select auth.uid()) 
      AND wu.status = 'active'
  )
);

DROP POLICY IF EXISTS "Users can insert deal stage history" ON public.deal_stage_history;
CREATE POLICY "Users can insert deal stage history" ON public.deal_stage_history FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.deals d
    WHERE d.id = deal_stage_history.deal_id 
      AND public.is_workspace_member(d.workspace_id, (select auth.uid()))
  )
);

-- ----------------------------------------------------------------------------
-- Table: files
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "view_files" ON public.files;
CREATE POLICY "view_files" ON public.files FOR SELECT USING (
  deleted_at IS NULL 
  AND 
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = files.workspace_id
  )
);

DROP POLICY IF EXISTS "insert_files" ON public.files;
CREATE POLICY "insert_files" ON public.files FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = files.workspace_id
  )
);

DROP POLICY IF EXISTS "delete_files" ON public.files;
CREATE POLICY "delete_files" ON public.files FOR DELETE USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = files.workspace_id 
      AND (wu.role IN ('owner', 'admin') OR files.uploaded_by = (select auth.uid()))
  )
);

-- ----------------------------------------------------------------------------
-- Table: integrations
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "manage_integrations" ON public.integrations;
CREATE POLICY "manage_integrations" ON public.integrations FOR ALL USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = integrations.workspace_id 
      AND wu.role IN ('owner', 'admin')
  )
);

-- ----------------------------------------------------------------------------
-- Table: pipelines
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "manage_pipelines" ON public.pipelines;
CREATE POLICY "manage_pipelines" ON public.pipelines FOR ALL USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = pipelines.workspace_id
  )
);

-- ----------------------------------------------------------------------------
-- Table: product_categories
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "manage_product_categories" ON public.product_categories;
CREATE POLICY "manage_product_categories" ON public.product_categories FOR ALL USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = product_categories.workspace_id
  )
);

-- ----------------------------------------------------------------------------
-- Table: products
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "view_products" ON public.products;
CREATE POLICY "view_products" ON public.products FOR SELECT USING (
  deleted_at IS NULL 
  AND 
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = products.workspace_id
  )
);

DROP POLICY IF EXISTS "manage_products" ON public.products;
CREATE POLICY "manage_products" ON public.products FOR ALL USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = products.workspace_id 
      AND wu.role IN ('owner', 'admin', 'manager')
  )
);

-- ----------------------------------------------------------------------------
-- Table: subscriptions
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "view_subscription" ON public.subscriptions;
CREATE POLICY "view_subscription" ON public.subscriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = subscriptions.workspace_id
  )
);

DROP POLICY IF EXISTS "manage_subscription_by_owner" ON public.subscriptions;
CREATE POLICY "manage_subscription_by_owner" ON public.subscriptions FOR ALL USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = subscriptions.workspace_id 
      AND wu.role = 'owner'
  )
);

-- ----------------------------------------------------------------------------
-- Table: workspace_invitations
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "admins_manage_invitations" ON public.workspace_invitations;
CREATE POLICY "admins_manage_invitations" ON public.workspace_invitations FOR ALL USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.role IN ('owner', 'admin') 
      AND wu.workspace_id = workspace_invitations.workspace_id
  )
);

DROP POLICY IF EXISTS "invited_user_can_view" ON public.workspace_invitations;
CREATE POLICY "invited_user_can_view" ON public.workspace_invitations FOR SELECT USING (
  email = (SELECT u.email FROM auth.users u WHERE u.id = (select auth.uid()))
);

-- ----------------------------------------------------------------------------
-- Table: workspace_quotas
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "view_quotas" ON public.workspace_quotas;
CREATE POLICY "view_quotas" ON public.workspace_quotas FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = workspace_quotas.workspace_id
  )
);

DROP POLICY IF EXISTS "Admins can update quotas" ON public.workspace_quotas;
CREATE POLICY "Admins can update quotas" ON public.workspace_quotas FOR UPDATE USING (
  public.get_workspace_role((select auth.uid()), workspace_id) IN ('owner', 'admin')
);

-- ----------------------------------------------------------------------------
-- Table: notifications
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "user_can_manage_own_notifications" ON public.notifications;
CREATE POLICY "user_can_manage_own_notifications" ON public.notifications FOR ALL USING (
  user_id = (select auth.uid()) 
  AND 
  EXISTS (
    SELECT 1 
    FROM public.workspace_users wu 
    WHERE wu.user_id = (select auth.uid()) 
      AND wu.status = 'active' 
      AND wu.workspace_id = notifications.workspace_id
  )
);

-- ============================================================================
-- ЧАСТЬ 2: УДАЛЕНИЕ НЕИСПОЛЬЗУЕМЫХ ИНДЕКСОВ
-- Эти индексы никогда не использовались и занимают место
-- ============================================================================

-- Индексы для contacts (используются редко, но могут быть полезны - оставляем)
-- DROP INDEX IF EXISTS public.idx_contacts_owner;
-- DROP INDEX IF EXISTS public.idx_contacts_search;
-- DROP INDEX IF EXISTS public.idx_contacts_tags;

-- Индексы для companies (могут быть полезны - оставляем)
-- DROP INDEX IF EXISTS public.idx_companies_owner;
-- DROP INDEX IF EXISTS public.idx_companies_search;
-- DROP INDEX IF EXISTS public.idx_companies_tags;

-- Индексы для deals - контекстно не используются
DROP INDEX IF EXISTS public.idx_deals_contact;
DROP INDEX IF EXISTS public.idx_deals_company;

-- Индексы для products - не используются
DROP INDEX IF EXISTS public.idx_products_workspace;
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_active;

-- Индексы для tasks - контекстно не используется
DROP INDEX IF EXISTS public.idx_tasks_assigned_to;

-- Индексы для activities - не используются
DROP INDEX IF EXISTS public.idx_activities_contact;
DROP INDEX IF EXISTS public.idx_activities_deal;
DROP INDEX IF EXISTS public.idx_activities_created_at;

-- Индексы для files - не используется
DROP INDEX IF EXISTS public.idx_files_workspace;

-- ============================================================================
-- СОЗДАНИЕ БОЛЕЕ ЭФФЕКТИВНЫХ СОСТАВНЫХ ИНДЕКСОВ
-- Вместо удаленных индексов создаем более эффективные составные индексы
-- ============================================================================

-- Для deals: комбинированный индекс для частых запросов по workspace + status
CREATE INDEX IF NOT EXISTS idx_deals_workspace_status 
ON public.deals(workspace_id, status) 
WHERE deleted_at IS NULL;

-- Для products: комбинированный индекс для активных продуктов по workspace
CREATE INDEX IF NOT EXISTS idx_products_workspace_active 
ON public.products(workspace_id, is_active) 
WHERE deleted_at IS NULL;

-- Для tasks: комбинированный индекс для активных задач по исполнителю
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status 
ON public.tasks(assigned_to, status, due_date) 
WHERE deleted_at IS NULL;

-- Для activities: комбинированный индекс для недавних активностей по workspace
CREATE INDEX IF NOT EXISTS idx_activities_workspace_recent 
ON public.activities(workspace_id, created_at DESC);

-- Для files: комбинированный индекс для активных файлов по workspace
CREATE INDEX IF NOT EXISTS idx_files_workspace_active 
ON public.files(workspace_id, uploaded_at DESC) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================================

-- Добавляем комментарий к миграции
COMMENT ON EXTENSION "uuid-ossp" IS 'Performance optimization migration: Fixed all RLS policies to use (select auth.uid()) and removed unused indexes';
