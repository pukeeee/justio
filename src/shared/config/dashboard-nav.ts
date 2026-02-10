/**
 * Конфігурація навігації для Dashboard
 * Адаптовано під CRM для юридичних фірм
 */

import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  DollarSign,
  Inbox,
  Settings,
  BookOpen,
  Trash2,
  type LucideIcon,
} from "lucide-react";

/**
 * Тип для елемента навігації
 */
export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

/**
 * Генерує посилання з урахуванням slug воркспейсу
 */
export function getWorkspaceUrl(slug: string, path: string): string {
  return `/dashboard/${slug}${path}`;
}

/**
 * Основна навігація Dashboard
 *
 * ВАЖЛИВО: href містить тільки шлях після /dashboard/{slug}
 * Повний URL формується динамічно через getWorkspaceUrl()
 */
export const DASHBOARD_NAV: NavItem[] = [
  {
    name: "Огляд",
    href: "",
    icon: LayoutDashboard,
    description: "Головна панель з аналітикою",
  },
  {
    name: "Клієнти",
    href: "/clients",
    icon: Users,
    description: "База клієнтів",
  },
  {
    name: "Справи",
    href: "/cases",
    icon: Briefcase,
    description: "Юридичні справи",
  },
  {
    name: "Документи???",
    href: "/documents",
    icon: FileText,
    description: "Договори, позови, рішення",
  },
  {
    name: "Календар",
    href: "/calendar",
    icon: Calendar,
    description: "Засідання, строки, дедлайни",
  },
  {
    name: "Фінанси",
    href: "/finance",
    icon: DollarSign,
    description: "Рахунки, платежі, гонорари",
  },
  {
    name: "Вхідні???",
    href: "/inbox",
    icon: Inbox,
    description: "Запити, звернення, листування",
  },
];

/**
 * Додаткова навігація (Settings, Docs тощо)
 */
export const DASHBOARD_SECONDARY_NAV: NavItem[] = [
  {
    name: "База знань",
    href: "/knowledge",
    icon: BookOpen,
    description: "Юридична база, закони, практика",
  },
  {
    name: "Налаштування",
    href: "/settings",
    icon: Settings,
    description: "Параметри воркспейсу",
  },
  {
    name: "Кошик",
    href: "/bin",
    icon: Trash2,
    description: "Параметри воркспейсу",
  },
];

/**
 * Всі маршрути dashboard для middleware
 */
export const ALL_DASHBOARD_ROUTES = [
  ...DASHBOARD_NAV.map((item) => item.href),
  ...DASHBOARD_SECONDARY_NAV.map((item) => item.href),
];
