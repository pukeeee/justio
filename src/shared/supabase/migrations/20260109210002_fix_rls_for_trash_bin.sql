-- ============================================================================
-- Migration: Виправлення RLS та активація функції "Кошика"
-- Description:
-- 1. Оновлює RLS для 'deals', щоб дозволити перегляд м'яко видалених записів (для кошика).
-- 2. Виправляє помилку RLS 'new row violates policy' під час оновлення угод.
-- 3. Додає відсутню політику INSERT для 'deal_stage_history', виправляючи помилку в 'moveToStage'.
-- ============================================================================

-- ============================================================================
-- Крок 1: Оновлення політик для таблиці 'deals'
-- ============================================================================

-- Спочатку видаляємо старі політики SELECT та UPDATE для 'deals'
DROP POLICY IF EXISTS "Users can view deals in their workspace" ON public.deals;
DROP POLICY IF EXISTS "Users can update their deals" ON public.deals;

-- Створюємо нову політику SELECT, яка НЕ фільтрує м'яко видалені записи на рівні RLS.
-- Це дозволяє реалізувати "кошик" і виправляє помилку .select() після softDelete.
CREATE POLICY "Users can view deals in their workspace" ON public.deals
FOR SELECT
USING (
  public.is_workspace_member(workspace_id, auth.uid())
);

-- Створюємо нову політику UPDATE, яка розділяє USING і WITH CHECK.
-- USING: дозволяє оновлювати тільки не видалені угоди.
-- WITH CHECK: перевіряє права доступу, але не стан 'deleted_at', дозволяючи м'яке видалення.
CREATE POLICY "Users can update their deals" ON public.deals
FOR UPDATE
USING (
  deleted_at IS NULL AND
  (
    (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin', 'manager')) OR
    deals.owner_id = auth.uid()
  )
)
WITH CHECK (
  (
    (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'admin', 'manager')) OR
    deals.owner_id = auth.uid()
  )
);

-- ============================================================================
-- Крок 2: Додавання політики INSERT для "deal_stage_history"
-- ============================================================================
-- Дозволяємо тригеру створювати записи в історії, якщо користувач має доступ до угоди.

CREATE POLICY "Users can insert deal stage history" ON public.deal_stage_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.deals d
    WHERE d.id = deal_stage_history.deal_id AND public.is_workspace_member(d.workspace_id, auth.uid())
  )
);
