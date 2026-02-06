-- ============================================================================
-- Міграція: Консолідована та виправлена RPC для безпечного створення воркспейсу
-- Дата: 2026-01-22
-- Опис: Ця єдина міграція об'єднує три попередні спроби створення RPC для воркспейсу.
-- Вона виправляє помилку "невідповідності типів", перейменовуючи змінну 'current_user'
-- на 'v_current_user_id', щоб уникнути конфліктів із зарезервованим ключовим словом PostgreSQL.
-- Також вона забезпечує надійність та ідемпотентність генерації slug та обмежень.
-- ============================================================================
BEGIN;

-- ============================================================================
-- 1. Генератор slug (ідемпотентний та безпечний)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_random_slug()
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  random_bytes bytea;
  slug text;
BEGIN
  -- Генеруємо 8 випадкових байтів
  random_bytes := extensions.gen_random_bytes(8);

  -- Кодуємо в Base64 та робимо його безпечним для URL
  slug := replace(
            replace(
              encode(random_bytes, 'base64'),
            '+', '-'),
          '/', '_');

  -- Обрізаємо заповнювач та обмежуємо довжину
  slug := left(trim(trailing '=' FROM slug), 10);

  RETURN slug;
END;
$$;
COMMENT ON FUNCTION public.generate_random_slug IS 'Генерує короткий, URL-безпечний, випадковий slug з випадкових байтів.';

-- ============================================================================
-- 2. Підготовка колонки `workspaces.slug` для надійних обмежень
-- Цей блок є ідемпотентним і може бути безпечно виконаний кілька разів.
-- ============================================================================

-- 2.1 Видаляємо старе обмеження для slug, якщо воно існує з початкової схеми
ALTER TABLE public.workspaces
  DROP CONSTRAINT IF EXISTS workspaces_slug_check;

-- 2.2 Дозволяємо slug тимчасово бути NULL для виправлення невалідних даних
ALTER TABLE public.workspaces
  ALTER COLUMN slug DROP NOT NULL;

-- 2.3 Знаходимо та виправляємо існуючі невалідні slug, щоб уникнути помилок обмежень
UPDATE public.workspaces
SET slug = public.generate_random_slug()
WHERE slug IS NULL
   OR trim(slug) = ''
   OR length(slug) < 8
   OR slug !~ '^[a-zA-Z0-9_-]+$';

-- 2.4 Повертаємо обмеження NOT NULL після очищення даних
ALTER TABLE public.workspaces
  ALTER COLUMN slug SET NOT NULL;

-- 2.5 Додаємо надійне перевірочне обмеження для формату slug
ALTER TABLE public.workspaces
  ADD CONSTRAINT workspaces_slug_check
  CHECK (
    slug ~ '^[a-zA-Z0-9_-]+$' -- Дозволити тільки URL-безпечні символи
    AND length(slug) >= 8     -- Застосувати мінімальну довжину
  );

-- 2.6 Гарантуємо, що slug завжди унікальний серед усіх воркспейсів
-- Використання CREATE UNIQUE INDEX IF NOT EXISTS є безпечним для повторних запусків.
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_slug_key;
DROP INDEX IF EXISTS public.workspaces_slug_unique;
CREATE UNIQUE INDEX workspaces_slug_unique ON public.workspaces (slug);


-- ============================================================================
-- 3. Видаляємо стару RPC-функцію перед створенням нової, виправленої версії
-- ============================================================================
DROP FUNCTION IF EXISTS public.create_workspace_with_owner(text);

-- ============================================================================
-- 4. RPC: Атомарне створення воркспейсу з власником та логікою повторних спроб
-- Це виправлена версія функції.
-- ============================================================================
CREATE FUNCTION public.create_workspace_with_owner(p_name text)
RETURNS TABLE (
  workspace_id uuid,
  workspace_name text,
  workspace_slug text
)
LANGUAGE plpgsql
-- SECURITY DEFINER дозволяє функції виконуватися з правами користувача, що її створив,
-- обходячи RLS для початкових вставок. Це безпечно, оскільки функція використовує
-- лише надану назву та ID автентифікованого користувача.
SECURITY DEFINER
-- SET search_path = public запобігає атакам на шлях пошуку.
SET search_path = public
AS $$
DECLARE
  v_new_id uuid;
  v_new_slug text;
  -- ВАЖЛИВЕ ВИПРАВЛЕННЯ: Перейменовано з `current_user` для уникнення конфлікту з зарезервованим словом PostgreSQL.
  v_current_user_id uuid := auth.uid();
BEGIN
  -- 1. Валідація вхідної назви воркспейсу
  IF trim(p_name) = ''
     OR length(p_name) < 2
     OR length(p_name) > 100 THEN
    RAISE EXCEPTION 'Назва воркспейсу повинна містити від 2 до 100 символів.';
  END IF;

  -- 2. Спроба вставити новий воркспейс, з повторними спробами при колізії slug
  FOR i IN 1..5 LOOP
    BEGIN
      INSERT INTO public.workspaces (name, owner_id, slug)
      VALUES (p_name, v_current_user_id, public.generate_random_slug())
      RETURNING id, slug
      INTO v_new_id, v_new_slug;

      -- Якщо вставка успішна, виходимо з циклу
      EXIT;
    EXCEPTION
      -- Якщо виникає колізія унікального slug, цикл продовжиться і спробує ще раз
      WHEN unique_violation THEN
        CONTINUE;
    END;
  END LOOP;

  -- 3. Якщо після 5 спроб ID все ще не отримано, щось пішло не так.
  IF v_new_id IS NULL THEN
    RAISE EXCEPTION 'Не вдалося згенерувати унікальний slug для воркспейсу після 5 спроб.';
  END IF;

  -- 4. Автоматично додаємо творця як 'owner' в таблицю workspace_users.
  INSERT INTO public.workspace_users (workspace_id, user_id, role)
  VALUES (v_new_id, v_current_user_id, 'owner');

  -- 5. Повертаємо деталі щойно створеного воркспейсу.
  RETURN QUERY
  SELECT
    ws.id AS workspace_id,
    ws.name AS workspace_name,
    ws.slug AS workspace_slug
  FROM public.workspaces ws
  WHERE ws.id = v_new_id;
END;
$$;
COMMENT ON FUNCTION public.create_workspace_with_owner IS 'Створює новий воркспейс, встановлює викликаючого як власника, та повертає деталі нового воркспейсу. Обробляє генерацію slug з повторними спробами.';


COMMIT;
-- ============================================================================
-- КІНЕЦЬ МІГРАЦІЇ
-- ============================================================================
