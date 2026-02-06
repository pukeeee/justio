-- ============================================================================
-- Крок 1: Створення допоміжних функцій для безпечної перевірки ролей та членства користувачів
-- ============================================================================
-- Ці функції використовують SECURITY DEFINER для обходу RLS та запобігання рекурсії.

-- Функція для безпечної перевірки ролі користувача у воркспейсі.
CREATE OR REPLACE FUNCTION public.get_workspace_role(p_workspace_id UUID, p_user_id UUID)
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Обходить RLS завдяки SECURITY DEFINER
  SELECT role INTO v_role
  FROM public.workspace_users
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status = 'active';
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
COMMENT ON FUNCTION public.get_workspace_role IS 'Безпечно отримує роль користувача в межах певного воркспейсу, обходячи RLS. Повертає NULL, якщо користувач не знайдений або неактивний.';

-- Функція для безпечної перевірки, чи є користувач активним членом воркспейсу.
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Обходить RLS завдяки SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_users
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
COMMENT ON FUNCTION public.is_workspace_member IS 'Безпечно перевіряє, чи є користувач активним членом воркспейсу, обходячи RLS.';


-- ============================================================================
-- Крок 2: Видалення старих рекурсивних політик для таблиці workspace_users
-- ============================================================================

DROP POLICY IF EXISTS "Users can view team members in their workspace" ON public.workspace_users;
DROP POLICY IF EXISTS "Admins can insert new users" ON public.workspace_users;
DROP POLICY IF EXISTS "Admins can update team members" ON public.workspace_users;


-- ============================================================================
-- Крок 3: Створення нових, нерекурсивних політик з використанням допоміжних функцій
-- ============================================================================

-- Користувачі можуть переглядати інших користувачів лише в межах воркспейсів, членами яких вони є.
CREATE POLICY "Users can view team members in their workspace" ON public.workspace_users FOR SELECT USING
  (public.is_workspace_member(workspace_id, auth.uid()));

-- Адміністратори та власники можуть додавати нових користувачів до свого воркспейсу.
CREATE POLICY "Admins can insert new users" ON public.workspace_users FOR INSERT WITH CHECK
  (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin'));

-- Адміністратори/власники можуть оновлювати будь-якого користувача у воркспейсі. Користувачі можуть оновлювати власний запис (напр., для виходу).
CREATE POLICY "Admins or self can update team members" ON public.workspace_users FOR UPDATE USING
  ((public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')) OR (user_id = auth.uid()));

-- Адміністратори/власники можуть видаляти користувачів. Користувачі можуть видаляти себе.
CREATE POLICY "Admins can remove users, or users can remove themselves" ON public.workspace_users FOR DELETE USING
  ((public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin')) OR (user_id = auth.uid()));
