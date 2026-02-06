-- ============================================================================
-- Migration: Комплексне виправлення RLS для таблиці "companies"
-- Reason: Попередня політика UPDATE не дозволяла виконувати м'яке видалення,
--         спричиняючи помилку "new row violates row-level security policy".
--         Також політика SELECT занадто суворо фільтрувала видалені записи,
--         що перешкоджало реалізації "кошика".
-- Strategy:
-- 1. Видалити старі політики SELECT та UPDATE.
-- 2. Створити нову політику SELECT, яка не фільтрує по `deleted_at` на рівні RLS.
-- 3. Створити нову політику UPDATE з розділеними `USING` та `WITH CHECK`,
--    щоб дозволити менеджерам м'яке видалення, але заборонити його для звичайних користувачів.
-- ============================================================================

-- Крок 1: Видаляємо старі, некоректні політики.
DROP POLICY IF EXISTS "Users can view companies in their workspace" ON public.companies;
DROP POLICY IF EXISTS "Users can update companies" ON public.companies;
DROP POLICY IF EXISTS "Користувачі можуть оновлювати власні компанії, а менеджери - будь-які" ON public.companies;
DROP POLICY IF EXISTS "Users can update their or managed companies" ON public.companies;

-- Крок 2: Створюємо нову політику SELECT, що дозволяє логіці програми керувати видимістю видалених записів.
CREATE POLICY "Users can view companies in their workspace" ON public.companies
FOR SELECT
USING (
  public.is_workspace_member(workspace_id, auth.uid())
);

-- Крок 3: Створюємо нову, гранулярну політику UPDATE.
CREATE POLICY "Users can update their or managed companies" ON public.companies
FOR UPDATE
USING (
    -- Оновлювати можна тільки ті компанії, що ще не були м'яко видалені.
    deleted_at IS NULL
    AND
    EXISTS (
        SELECT 1
        FROM public.workspace_users wu
        WHERE wu.user_id = auth.uid()
          AND wu.status = 'active'
          AND wu.workspace_id = companies.workspace_id
          AND (
            -- Менеджери/Власники/Адміни можуть редагувати будь-яку компанію
            wu.role IN ('owner', 'admin', 'manager')
            OR
            -- Користувачі (role='user') можуть редагувати компанії, які вони створили
            (wu.role = 'user' AND companies.created_by = auth.uid())
          )
    )
)
WITH CHECK (
    -- Перевірка прав доступу застосовується до нового рядка.
    EXISTS (
        SELECT 1
        FROM public.workspace_users wu
        WHERE wu.user_id = auth.uid()
          AND wu.status = 'active'
          AND wu.workspace_id = companies.workspace_id
          AND (
            -- Менеджери/Власники/Адміни можуть робити що завгодно (включаючи soft-delete).
            wu.role IN ('owner', 'admin', 'manager')
            OR
            -- Користувачі ('user') можуть оновлювати свою компанію,
            -- АЛЕ тільки якщо вони не намагаються її м'яко видалити.
            (wu.role = 'user' AND companies.created_by = auth.uid() AND companies.deleted_at IS NULL)
          )
    )
);