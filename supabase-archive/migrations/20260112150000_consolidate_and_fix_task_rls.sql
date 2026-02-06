-- ============================================================================
-- Міграція: Консолідація та виправлення політик RLS для таблиці "tasks"
-- Причина: Попередні міграції містили проміжні та некоректні стани,
-- що ускладнювало налагодження та призводило до помилок. Ця міграція
-- об'єднує логіку з трьох попередніх файлів в один, встановлюючи
-- фінальні, коректні політики для створення, оновлення, видалення та перегляду завдань.
-- ============================================================================

-- Крок 1: Видаляємо всі можливі старі версії політик для "tasks" для чистого стану.
DROP POLICY IF EXISTS "Users can view their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks for workspace members" ON public.tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Granular task update policy" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their or managed tasks" ON public.tasks;
DROP POLICY IF EXISTS "Managers can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Managers and owners can delete tasks" ON public.tasks;

-- Крок 2: Створюємо фінальний, коректний набір RLS-політик для таблиці "tasks".

-- SELECT: Дозволяє користувачам переглядати завдання у своїх воркспейсах.
-- Фільтрація м'яко видалених записів (`deleted_at`) свідомо прибрана з RLS
-- для підтримки функціоналу "кошика" на стороні клієнта.
CREATE POLICY "Users can view their tasks" ON public.tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_users wu
    WHERE wu.user_id = auth.uid()
      AND wu.status = 'active'
      AND wu.workspace_id = tasks.workspace_id
      AND (
        wu.role IN ('owner', 'admin', 'manager') OR
        tasks.assigned_to = auth.uid() OR
        tasks.created_by = auth.uid()
      )
  )
);

-- INSERT: Дозволяє користувачам створювати завдання.
-- Перевіряє, що і творець, і виконавець є активними членами воркспейсу
-- і творець має відповідні права.
CREATE POLICY "Users can insert tasks for workspace members" ON public.tasks
FOR INSERT
WITH CHECK (
    created_by = auth.uid()
    AND
    (get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin', 'manager', 'user'))
    AND
    (get_workspace_role(assigned_to, workspace_id) IS NOT NULL)
);

-- UPDATE: Гранулярна політика оновлення завдань.
-- Дозволяє менеджерам робити будь-які оновлення (включаючи м'яке видалення).
-- Дозволяє звичайним користувачам оновлювати тільки ті завдання, що на них призначені,
-- і забороняє їм робити м'яке видалення.
CREATE POLICY "Users can update their or managed tasks" ON public.tasks
FOR UPDATE
USING (
    -- Оновлювати можна тільки ті завдання, що ще не були м'яко видалені.
    deleted_at IS NULL AND (
        (get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin', 'manager'))
        OR
        (assigned_to = auth.uid())
    )
)
WITH CHECK (
    -- Менеджери та вище можуть робити будь-що (включаючи soft-delete).
    (get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin', 'manager'))
    OR
    -- Звичайні користувачі можуть оновлювати, лише якщо вони є виконавцями
    -- І ЯКЩО вони не намагаються м'яко видалити завдання.
    (assigned_to = auth.uid() AND deleted_at IS NULL)
);

-- DELETE: Дозволяє жорстке видалення завдань тільки користувачам з підвищеними правами.
CREATE POLICY "Managers and owners can hard-delete tasks" ON public.tasks
FOR DELETE
USING (
    get_workspace_role(auth.uid(), workspace_id) IN ('owner', 'admin', 'manager')
);
