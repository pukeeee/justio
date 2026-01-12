-- ============================================================================
-- Migration: Комплексне виправлення RLS (Версія 3 - Фінальна)
-- Reason: Усуває каскадні помилки, спричинені конфліктом сигнатур функції 
--         `get_workspace_role` та оновлює ОСТАННЮ залежну політику для `workspace_quotas`.
-- Strategy:
-- 1. Видалити всі RLS-політики, що залежать від старої функції.
-- 2. Видалити стару, некоректну функцію.
-- 3. Створити нову, стандартизовану функцію.
-- 4. Відновити всі політики (включаючи `workspace_quotas`) з використанням нової функції.
-- ============================================================================

-- ============================================================================
-- Крок 1: Видалення всіх політик, що залежать від старої функції.
-- ============================================================================

-- Політики для 'activities'
DROP POLICY IF EXISTS "Allow non-guest members to create activities" ON public.activities;
DROP POLICY IF EXISTS "Allow update of notes based on role" ON public.activities;
DROP POLICY IF EXISTS "Allow deletion of notes based on role" ON public.activities;
DROP POLICY IF EXISTS "Users can view activities in their workspace" ON public.activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update their own notes, managers can update any" ON public.activities;
DROP POLICY IF EXISTS "Users can delete their own notes, managers can delete any" ON public.activities;
DROP POLICY IF EXISTS "view_activities" ON public.activities;
DROP POLICY IF EXISTS "insert_activities" ON public.activities;

-- Політики для 'workspace_users'
DROP POLICY IF EXISTS "Admins can insert new users" ON public.workspace_users;
DROP POLICY IF EXISTS "Admins or self can update team members" ON public.workspace_users;
DROP POLICY IF EXISTS "Admins can remove users, or users can remove themselves" ON public.workspace_users;
DROP POLICY IF EXISTS "Users can view team members in their workspace" ON public.workspace_users;

-- Політики для 'deals'
DROP POLICY IF EXISTS "Users can update their deals" ON public.deals;

-- Політики для 'workspace_quotas' (НОВЕ)
DROP POLICY IF EXISTS "admins_update_quotas" ON public.workspace_quotas;
DROP POLICY IF EXISTS "Admins can update quotas" ON public.workspace_quotas;


-- ============================================================================
-- Крок 2: Видалення старої, проблемної функції.
-- ============================================================================
DROP FUNCTION IF EXISTS public.get_workspace_role(UUID, UUID);


-- ============================================================================
-- Крок 3: Створення нової, стандартизованої допоміжної функції.
-- Сигнатура: (user_id UUID, workspace_id UUID) RETURNS TEXT
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_workspace_role(p_user_id UUID, p_workspace_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Ми приводимо ENUM 'user_role' до TEXT, щоб стандартизувати тип, що повертається.
  SELECT role::TEXT INTO v_role
  FROM public.workspace_users
  WHERE user_id = p_user_id AND workspace_id = p_workspace_id AND status = 'active';
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ============================================================================
-- Крок 4: Відновлення всіх політик з використанням нової, коректної функції.
-- ============================================================================

-- Політики для 'workspace_users'
CREATE POLICY "Users can view team members in their workspace" ON public.workspace_users 
FOR SELECT 
USING ( public.is_workspace_member(workspace_id, auth.uid()) );

CREATE POLICY "Admins can insert new users" ON public.workspace_users FOR INSERT WITH CHECK (public.get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin'));
CREATE POLICY "Admins or self can update team members" ON public.workspace_users FOR UPDATE USING ((public.get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin')) OR (user_id = auth.uid()));
CREATE POLICY "Admins can remove users, or users can remove themselves" ON public.workspace_users FOR DELETE USING ((public.get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin')) OR (user_id = auth.uid()));


-- Політики для 'activities'
CREATE POLICY "Users can view activities in their workspace" ON public.activities FOR SELECT USING ( public.is_workspace_member(workspace_id, auth.uid()) );
CREATE POLICY "Users can insert their own activities" ON public.activities FOR INSERT WITH CHECK ( (public.get_workspace_role(auth.uid(), workspace_id) IS NOT NULL AND public.get_workspace_role(auth.uid(), workspace_id) <> 'guest') AND (user_id = auth.uid()) );
CREATE POLICY "Users can update their own notes, managers can update any" ON public.activities FOR UPDATE USING ( (activity_type = 'note') AND ( (user_id = auth.uid()) OR (public.get_workspace_role(auth.uid(), workspace_id) IN ('manager', 'owner', 'admin')) ) );
CREATE POLICY "Users can delete their own notes, managers can delete any" ON public.activities FOR DELETE USING ( (activity_type = 'note') AND ( (user_id = auth.uid()) OR (public.get_workspace_role(auth.uid(), workspace_id) IN ('manager', 'owner', 'admin')) ) );

-- Політики для 'deals'
CREATE POLICY "Users can update their deals" ON public.deals
FOR UPDATE
USING (
  deleted_at IS NULL AND
  (
    (public.get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin', 'manager')) OR
    deals.owner_id = auth.uid()
  )
)
WITH CHECK (
  (
    (public.get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin', 'manager')) OR
    deals.owner_id = auth.uid()
  )
);

-- Політики для 'workspace_quotas' (НОВЕ)
CREATE POLICY "Admins can update quotas" ON public.workspace_quotas
FOR UPDATE
USING (
  public.get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin')
);