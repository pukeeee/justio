-- ============================================================================
-- Migration: Виправлення проблем з індексацією
-- Date: 2026-01-17
-- Description: Створює відсутні індекси для зовнішніх ключів згідно зі звітом
--              `unindexed_foreign_keys` для покращення продуктивності.
-- ============================================================================

-- Створення відсутніх індексів для зовнішніх ключів

-- contacts
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON public.contacts(owner_id);

-- deals
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON public.deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_id ON public.deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_workspace_id ON public.deals(workspace_id);

-- files
CREATE INDEX IF NOT EXISTS idx_files_workspace_id ON public.files(workspace_id);

-- products
CREATE INDEX IF NOT EXISTS idx_products_workspace_id ON public.products(workspace_id);

-- tasks
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);

-- Додаткові індекси з попередніх звітів для повноти
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON public.activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON public.activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON public.activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_task_id ON public.activities(task_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON public.contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_deal_products_product_id ON public.deal_products(product_id);
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_user_id ON public.deal_stage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON public.deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_created_by ON public.deals(created_by);
CREATE INDEX IF NOT EXISTS idx_files_company_id ON public.files(company_id);
CREATE INDEX IF NOT EXISTS idx_files_contact_id ON public.files(contact_id);
CREATE INDEX IF NOT EXISTS idx_files_deal_id ON public.files(deal_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON public.files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notifications_workspace_id ON public.notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_workspace_id ON public.pipelines(workspace_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON public.product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_workspace_id ON public.product_categories(workspace_id);
CREATE INDEX IF NOT EXISTS idx_product_price_history_changed_by ON public.product_price_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_product_price_history_product_id ON public.product_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON public.tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON public.tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_invited_by ON public.workspace_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);

-- ============================================================================
-- КІНЕЦЬ МІГРАЦІЇ
-- ============================================================================
