-- ============================================================================
-- Migration: Консолідація політик RLS для таблиці "contacts"
-- Reason: Цей файл об'єднує та замінює попередні інкрементні міграції
--         (20260114120000, 20260115100000) для спрощення структури міграцій
--         та забезпечення єдиного, коректного стану політик безпеки для контактів.
-- Strategy:
-- 1. Видалити всі попередні версії політик SELECT та UPDATE для таблиці `contacts`.
-- 2. Створити фінальні, коректні версії політик, що враховують ролі,
--    режим видимості воркспейсу та дозволяють відновлення м'яко видалених записів.
-- ============================================================================

-- Крок 1: Очищення старих політик для забезпечення ідемпотентності.
DROP POLICY IF EXISTS "Users can view contacts in their workspace" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their or managed contacts" ON public.contacts;
-- Також видаляємо нові, на випадок якщо міграція запускається повторно.
DROP POLICY IF EXISTS "Users can view contacts based on role and visibility_mode" ON public.contacts;
DROP POLICY IF EXISTS "Users can update contacts based on their role" ON public.contacts;


-- Крок 2: Створення фінальної політики SELECT.
-- Ця політика коректно обробляє видимість на основі ролі та налаштувань воркспейсу.
CREATE POLICY "Users can view contacts based on role and visibility_mode" ON public.contacts
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.workspace_users wu
        JOIN public.workspaces w ON wu.workspace_id = w.id
        WHERE wu.user_id = auth.uid()
          AND wu.status = 'active'
          AND wu.workspace_id = contacts.workspace_id
          AND (
            -- Власник, Адмін, Менеджер та Гість бачать усі контакти.
            wu.role IN ('owner', 'admin', 'manager', 'guest')
            OR
            -- Або користувач з роллю 'user' і режимом видимості 'all'
            (wu.role = 'user' AND w.settings->>'visibility_mode' = 'all')
            OR
            -- Або користувач з роллю 'user' в режимі 'own' і це його контакт
            (
              wu.role = 'user'
              AND COALESCE(w.settings->>'visibility_mode', 'own') = 'own'
              AND contacts.owner_id = auth.uid()
            )
          )
    )
);

-- Крок 3: Створення фінальної політики UPDATE.
-- Ця політика дозволяє оновлення та відновлення м'яко видалених записів.
CREATE POLICY "Users can update contacts based on their role" ON public.contacts
FOR UPDATE
USING (
    -- Перевіряємо, чи має користувач взагалі право на цей запис (аналогічно SELECT, але без 'guest').
    EXISTS (
        SELECT 1 FROM public.workspace_users wu
        WHERE wu.user_id = auth.uid()
          AND wu.status = 'active'
          AND wu.workspace_id = contacts.workspace_id
          AND (
            wu.role IN ('owner', 'admin', 'manager')
            OR
            (wu.role = 'user' AND contacts.owner_id = auth.uid())
          )
    )
)
WITH CHECK (
    -- Перевіряємо, чи дозволена сама операція оновлення.
    EXISTS (
        SELECT 1 FROM public.workspace_users wu
        WHERE wu.user_id = auth.uid()
          AND wu.status = 'active'
          AND wu.workspace_id = contacts.workspace_id
          AND (
            -- Менеджери та вище можуть робити будь-що (включаючи м'яке видалення/відновлення).
            wu.role IN ('owner', 'admin', 'manager')
            OR
            -- Користувач ('user') може оновлювати свій контакт, АЛЕ не може його м'яко видалити.
            -- `contacts.deleted_at IS NULL` застосовується до НОВОГО стану рядка.
            (wu.role = 'user' AND contacts.owner_id = auth.uid() AND contacts.deleted_at IS NULL)
          )
    )
);
