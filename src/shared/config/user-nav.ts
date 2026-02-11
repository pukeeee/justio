/**
 * Конфігурація для навігації користувача
 * Використовується в UserNav та ProfileDropdown
 */

import {
  User,
  Building2,
  Settings,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Тип для елемента навігації
 */
export type UserPageItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

/**
 * Основні сторінки профілю користувача
 */
export const USER_PAGES: UserPageItem[] = [
  {
    label: "Профіль",
    href: "/user/profile",
    icon: User,
    description: "Особиста інформація",
  },
  {
    label: "Воркспейси",
    href: "/user/workspace",
    icon: Building2,
    description: "Управління робочими просторами",
  },
  {
    label: "Налаштування",
    href: "/user/settings",
    icon: Settings,
    description: "Параметри системи",
  },
  {
    label: "Білінг",
    href: "/user/billing",
    icon: CreditCard,
    description: "Підписка та платежі",
  },
];

/**
 * Додаткові дії в меню
 */
export const USER_ACTIONS = [
  {
    label: "Сповіщення",
    icon: Bell,
    action: "notifications" as const,
  },
  {
    label: "Безпека",
    icon: Shield,
    action: "security" as const,
  },
] as const;

/**
 * Опція оновлення тарифу
 */
export const UPGRADE_ACTION = {
      label: "Оновити до Firm",  icon: Sparkles,
  href: "/user/billing?upgrade=true",
} as const;

/**
 * Дія виходу
 */
export const LOGOUT_ACTION = {
  label: "Вийти",
  icon: LogOut,
} as const;
