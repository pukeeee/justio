-- Комплексне налаштування RLS-політик для таблиці "activities".
-- Ця міграція замінює попередні налаштування на більш деталізовані та безпечні,
-- відповідно до оновленої документації та архітектурних рішень.

-- Крок 1: Видаляємо всі попередні політики для "activities", щоб гарантувати чистий стан.
DROP POLICY IF EXISTS "Allow members to view workspace activities" ON public.activities;
DROP POLICY IF EXISTS "Allow non-guest members to create activities" ON public.activities;
DROP POLICY IF EXISTS "Allow update of notes based on role" ON public.activities;
DROP POLICY IF EXISTS "Allow deletion of notes based on role" ON public.activities;
-- Видаляємо старі назви політик з попередніх версій цієї міграції.
DROP POLICY IF EXISTS "Allow owner to update their own activities" ON public.activities;
DROP POLICY IF EXISTS "Allow workspace members to update activities" ON public.activities;


-- Крок 2: Створюємо нові, коректні політики.

-- SELECT: Будь-який член воркспейсу може переглядати активності.
-- Видимість конкретних активностей буде додатково обмежуватись доступом
-- до батьківських сутностей (угод, контактів).
CREATE POLICY "Allow members to view workspace activities"
  ON public.activities
  FOR SELECT
  USING ( is_workspace_member(auth.uid(), workspace_id) );

-- INSERT: Будь-який член воркспейсу, крім 'guest', може створювати активності.
CREATE POLICY "Allow non-guest members to create activities"
  ON public.activities
  FOR INSERT
  WITH CHECK (
    is_workspace_member(auth.uid(), workspace_id)
    AND
    get_workspace_role(auth.uid(), workspace_id) <> 'guest'
  );

-- UPDATE: Редагувати можна ТІЛЬКИ примітки (type = 'note'), з урахуванням ролі.
-- Це захищає інші типи активностей (логи) від будь-яких змін.
CREATE POLICY "Allow update of notes based on role"
  ON public.activities
  FOR UPDATE
  USING (
    activity_type = 'note'
    AND (
      -- Власник примітки може її редагувати.
      auth.uid() = user_id
      OR
      -- Або користувач з роллю 'manager' чи вище може редагувати будь-яку примітку.
      get_workspace_role(auth.uid(), workspace_id) IN ('manager', 'admin', 'owner')
    )
  );

-- DELETE: Видаляти можна ТІЛЬКИ примітки (type = 'note'), з урахуванням ролі.
-- Це надійно захищає всі логи від видалення через звичайний API.
CREATE POLICY "Allow deletion of notes based on role"
  ON public.activities
  FOR DELETE
  USING (
    activity_type = 'note'
    AND (
      -- Власник примітки може її видалити.
      auth.uid() = user_id
      OR
      -- Або користувач з роллю 'manager' чи вище може видалити будь-яку примітку.
      get_workspace_role(auth.uid(), workspace_id) IN ('manager', 'admin', 'owner')
    )
  );