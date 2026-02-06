/**
 * Константи для Landing Page
 * Єдине джерело правди для всього контенту
 */

import {
  Users,
  TrendingUp,
  Calendar,
  BarChart,
  Truck,
  WifiOff,
  Smartphone,
  Globe,
  Check,
  FileText,
  MessageSquare,
} from "lucide-react";

export const LANDING_CONTENT = {
  header: {
    logo: "Justio CRM",
    nav: [
      { label: "Можливості", href: "#features" },
      { label: "Тарифи", href: "#pricing" },
      { label: "Документація", href: "/docs" },
    ],
    cta: { label: "Увійти", href: "/dashboard" },
  },

  hero: {
    title: "CRM для малого бізнесу в Україні",
    subtitle:
      "Керуйте клієнтами та продажами навіть без інтернету. Mobile-first. Інтеграція з Новою Поштою.",
    primaryCta: { label: "Почати безкоштовно", href: "/dashboard" },
    secondaryCta: { label: "Переглянути документацію", href: "/docs" },
    badges: [
      "Працює офлайн",
      "До 100 контактів безкоштовно",
      "Інтеграція з Новою Поштою",
    ],
  },

  painPoints: {
    title: "Знайомі проблеми?",
    points: [
      {
        icon: FileText,
        title: "Облік у Excel",
        description: "Таблиці не дають повної картини бізнесу",
      },
      {
        icon: Users,
        title: "Втрата клієнтів",
        description: "Інформація розкидана по блокнотах та месенджерах",
      },
      {
        icon: MessageSquare,
        title: "Немає історії",
        description: "Не пам'ятаєте, що обговорювали з клієнтом минулого разу",
      },
      {
        icon: TrendingUp,
        title: "Хаос у продажах",
        description: "Не розумієте, на якому етапі кожна угода",
      },
    ],
  },

  solution: {
    title: "Як це працює",
    steps: [
      {
        number: "01",
        title: "Додайте клієнтів",
        description: "Створіть базу контактів та компаній в один клік",
      },
      {
        number: "02",
        title: "Керуйте угодами",
        description:
          "Відстежуйте воронку продажів на Kanban-дошці. Drag & drop між етапами.",
      },
      {
        number: "03",
        title: "Аналізуйте",
        description: "Дивіться конверсію, план продажів та топ-менеджерів",
      },
    ],
  },

  features: {
    title: "Все необхідне для малого бізнесу",
    subtitle: "Функціонал, який реально використовується щодня",
    list: [
      {
        icon: Users,
        title: "Клієнти та Компанії",
        description:
          "Централізоване управління базою. Історія взаємодій. Теги та сегментація.",
      },
      {
        icon: TrendingUp,
        title: "Угоди та Воронка",
        description:
          "Kanban-дошка для візуалізації продажів. Автопрогноз. Історія змін етапів.",
      },
      {
        icon: Calendar,
        title: "Завдання",
        description:
          "Календар та нагадування. Прив'язка до клієнтів та угод. Командна робота.",
      },
      {
        icon: BarChart,
        title: "Базова Аналітика",
        description:
          "Конверсія воронки. План продажів. Топ-менеджери. Джерела лідів.",
      },
      {
        icon: Truck,
        title: "Інтеграція з Новою Поштою",
        description:
          "Створення ТТН прямо з картки угоди. Автозаповнення даних клієнта.",
      },
      {
        icon: WifiOff,
        title: "Офлайн-режим",
        description:
          "Працюйте без інтернету. Синхронізація автоматична при підключенні.",
      },
    ],
  },

  differentiators: {
    title: "Чому CRM4SMB",
    subtitle: "Створено спеціально для українського малого бізнесу",
    list: [
      {
        icon: Smartphone,
        title: "Mobile-first",
        description: "Понад 70% функцій доступні зі смартфона",
      },
      {
        icon: WifiOff,
        title: "Offline-first",
        description: "Працює навіть без стабільного інтернету",
      },
      {
        icon: Truck,
        title: "Локальні інтеграції",
        description: "Нова Пошта та українські сервіси з коробки",
      },
      {
        icon: Globe,
        title: "Українська локалізація",
        description:
          "Не просто переклад, а адаптація під український ринок і законодавство",
      },
      {
        icon: Check,
        title: "Доступність",
        description: "Безкоштовний план для старту без прив'язки карти",
      },
    ],
  },

  pricing: {
    title: "Прозорі тарифи",
    subtitle: "Почніть безкоштовно. Оновлюйтесь у міру зростання.",
    plans: [
      {
        id: "free",
        name: "Free",
        price: "0",
        period: "міс",
        description: "Для старту",
        features: [
          "1 робочий простір",
          "2 користувачі",
          "100 контактів",
          "50 угод",
          "500 MB сховища",
        ],
        cta: "Почати",
        href: "/dashboard",
        highlighted: false,
      },
      {
        id: "starter",
        name: "Starter",
        price: "299",
        period: "міс",
        description: "Для малого бізнесу",
        features: [
          "5 робочих просторів",
          "5 користувачів",
          "5,000 контактів",
          "1,000 угод",
          "5 GB сховища",
          "Пріоритетна підтримка",
        ],
        cta: "Спробувати",
        href: "/dashboard",
        highlighted: false,
      },
      {
        id: "pro",
        name: "Pro",
        price: "799",
        period: "міс",
        description: "Для зростаючих команд",
        features: [
          "20 робочих просторів",
          "20 користувачів",
          "50,000 контактів",
          "10,000 угод",
          "50 GB сховища",
          "Розширена аналітика",
        ],
        cta: "Спробувати",
        href: "/dashboard",
        highlighted: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "Індивідуально",
        period: "",
        description: "Для великих організацій",
        features: [
          "Необмежено всього",
          "White-label",
          "Персональний менеджер",
          "SLA гарантії",
        ],
        cta: "Зв'язатися",
        href: "mailto:sales@crm4smb.com",
        highlighted: false,
      },
    ],
  },

  faq: {
    title: "Часті запитання",
    items: [
      {
        question: "Чи потрібен мені інтернет для роботи з CRM?",
        answer:
          "Ні. CRM4SMB підтримує офлайн-режим. Ви можете додавати клієнтів та угоди без інтернету, а синхронізація відбудеться автоматично при підключенні.",
      },
      {
        question: "Скільки користувачів я можу додати?",
        answer:
          "На безкоштовному тарифі — до 2 користувачів. На Starter — до 5, на Pro — до 20, на Enterprise — необмежено.",
      },
      {
        question: "Чи є мобільний додаток?",
        answer:
          "CRM4SMB — це Progressive Web App (PWA). Ви можете встановити його на головний екран смартфона і працювати як з нативним додатком.",
      },
      {
        question: "Як працює інтеграція з Новою Поштою?",
        answer:
          "Ви можете створювати ТТН прямо з картки угоди. Система автоматично заповнює дані клієнта та зберігає номер накладної.",
      },
      {
        question: "Чи можу я перейти на нижчий тариф?",
        answer:
          "Так, але якщо ви перевищите ліміти нового тарифу (наприклад, кількість контактів), створення нових записів буде заблоковано до видалення зайвих або оновлення тарифу.",
      },
      {
        question: "Де зберігаються мої дані?",
        answer:
          "Дані зберігаються на серверах у Європейському Союзі з дотриманням GDPR та Закону України про захист персональних даних.",
      },
    ],
  },

  finalCta: {
    title: "Починайте керувати бізнесом вже сьогодні",
    subtitle:
      "Безкоштовний план. Без прив'язки карти. Оновлення у будь-який момент.",
    cta: { label: "Спробувати безкоштовно", href: "/dashboard" },
  },

  footer: {
    copyright: "© 2026 CRM4SMB. Всі права захищені.",
    columns: [
      {
        title: "Продукт",
        links: [
          { label: "Можливості", href: "#features" },
          { label: "Тарифи", href: "#pricing" },
          { label: "Документація", href: "/docs" },
        ],
      },
      {
        title: "Ресурси",
        links: [
          { label: "Підтримка", href: "/support" },
          { label: "API", href: "/docs/api" },
        ],
      },
      {
        title: "Юридичне",
        links: [
          { label: "Політика конфіденційності", href: "/privacy" },
          { label: "Умови використання", href: "/terms" },
        ],
      },
    ],
  },
} as const;
