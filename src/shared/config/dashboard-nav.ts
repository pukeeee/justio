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
import { dashboardRoutes } from "../routes/dashboard-routes";

/**
 * Тип для елемента навігації
 */
export type NavItem = {
  name: string;
  href: (slug: string) => string;
  icon: LucideIcon;
  description?: string;
};

/**
 * Основна навігація Dashboard
 */
export const DASHBOARD_NAV: NavItem[] = [
  {
    name: "Огляд",
    href: (slug: string) => dashboardRoutes.root(slug),
    icon: LayoutDashboard,
    description: "Головна панель з аналітикою",
  },
  {
    name: "Клієнти",
    href: (slug: string) => dashboardRoutes.clients(slug),
    icon: Users,
    description: "База клієнтів",
  },
  {
    name: "Справи",
    href: (slug: string) => dashboardRoutes.cases(slug),
    icon: Briefcase,
    description: "Юридичні справи",
  },
  {
    name: "Документи???",
    href: (slug: string) => dashboardRoutes.documents(slug),
    icon: FileText,
    description: "Договори, позови, рішення",
  },
  {
    name: "Календар",
    href: (slug: string) => dashboardRoutes.calendar(slug),
    icon: Calendar,
    description: "Засідання, строки, дедлайни",
  },
  {
    name: "Фінанси",
    href: (slug: string) => dashboardRoutes.finance(slug),
    icon: DollarSign,
    description: "Рахунки, платежі, гонорари",
  },
  {
    name: "Вхідні???",
    href: (slug: string) => dashboardRoutes.inbox(slug),
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
    href: (slug: string) => dashboardRoutes.knowledge(slug),
    icon: BookOpen,
    description: "Юридична база, закони, практика",
  },
  {
    name: "Налаштування",
    href: (slug: string) => dashboardRoutes.settings(slug),
    icon: Settings,
    description: "Параметри воркспейсу",
  },
  {
    name: "Кошик",
    href: (slug: string) => dashboardRoutes.bin(slug),
    icon: Trash2,
    description: "Видалені об'єкти",
  },
];

/**
 * Всі маршрути dashboard (відносні) для middleware або перевірок.
 * Ми використовуємо "test-slug" щоб отримати структуру шляхів.
 */
const TEST_SLUG = "test-slug";
const getPathOnly = (urlFn: (slug: string) => string) => 
  urlFn(TEST_SLUG).replace(`/dashboard/${TEST_SLUG}`, "") || "";

export const ALL_DASHBOARD_ROUTES = [
  ...DASHBOARD_NAV.map((item) => getPathOnly(item.href)),
  ...DASHBOARD_SECONDARY_NAV.map((item) => getPathOnly(item.href)),
];
