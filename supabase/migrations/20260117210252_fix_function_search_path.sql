-- ============================================================================
-- Міграція: Виправлення Search Path для функцій
-- Дата: 2026-01-18
-- Опис: Встановлює безпечний `search_path` для всіх функцій, що мали
--       попередження 'function_search_path_mutable' від Supabase linter.
--       Це усуває потенційні вразливості безпеки.
-- ============================================================================

-- Функція: get_workspace_role
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.get_workspace_role(p_user_id UUID, p_workspace_id UUID)
RETURNS TEXT
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role
  FROM public.workspace_users
  WHERE user_id = p_user_id AND workspace_id = p_workspace_id AND status = 'active';
  RETURN v_role;
END;
$$;

-- Функція: is_workspace_member
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_users
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status = 'active'
  );
END;
$$;

-- Функція: generate_invitation_token
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql VOLATILE SET search_path = public
AS $$
BEGIN
  RETURN encode(extensions.gen_random_bytes(32), 'hex');
END;
$$;

-- Функція: update_updated_at_column
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql VOLATILE SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Функція: update_deal_amount
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.update_deal_amount()
RETURNS TRIGGER
LANGUAGE plpgsql VOLATILE SET search_path = public
AS $$
DECLARE
  v_deal_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_deal_id := OLD.deal_id;
  ELSE
    v_deal_id := NEW.deal_id;
  END IF;

  UPDATE public.deals SET amount = (SELECT COALESCE(SUM(total), 0) FROM public.deal_products WHERE deal_id = v_deal_id) WHERE id = v_deal_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

-- Функція: track_deal_stage_change
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.track_deal_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql VOLATILE SET search_path = public
AS $$
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO public.deal_stage_history (deal_id, from_stage_id, to_stage_id, user_id)
    VALUES (NEW.id, OLD.stage_id, NEW.stage_id, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- Функція: update_workspace_usage
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.update_workspace_usage()
RETURNS TRIGGER
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  SET LOCAL row_level_security.enabled = OFF;

  IF TG_TABLE_NAME = 'contacts' THEN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
      UPDATE public.workspace_quotas SET current_contacts = current_contacts + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
      UPDATE public.workspace_quotas SET current_contacts = GREATEST(current_contacts - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'deals' THEN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
      UPDATE public.workspace_quotas SET current_deals = current_deals + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
      UPDATE public.workspace_quotas SET current_deals = GREATEST(current_deals - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  ELSIF TG_TABLE_NAME = 'workspace_users' THEN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
      UPDATE public.workspace_quotas SET current_users = current_users + 1, updated_at = NOW() WHERE workspace_id = NEW.workspace_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status != 'active' AND OLD.status = 'active') THEN
      UPDATE public.workspace_quotas SET current_users = GREATEST(current_users - 1, 0), updated_at = NOW() WHERE workspace_id = COALESCE(NEW.workspace_id, OLD.workspace_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Функція: log_product_price_change
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.log_product_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql VOLATILE SET search_path = public
AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO public.product_price_history (product_id, old_price, new_price, changed_by)
    VALUES (NEW.id, OLD.price, NEW.price, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- Функція: create_default_pipeline_and_quotas
-- Причина: Виправлення безпеки для 'function_search_path_mutable'
CREATE OR REPLACE FUNCTION public.create_default_pipeline_and_quotas()
RETURNS TRIGGER
LANGUAGE plpgsql VOLATILE SET search_path = public
AS $$
BEGIN
  INSERT INTO public.pipelines (workspace_id, name, is_default) VALUES (NEW.id, 'Основна воронка', TRUE);
  INSERT INTO public.workspace_quotas (workspace_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

