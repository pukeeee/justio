import { routes } from "@/shared/routes/main-routes";

export const pricingContent = {
  hero: {
    badge: "Тарифи",
    title: "Прості та прозорі ціни",
    description:
      "Жодних прихованих платежів чи несподіваних нарахувань. Тільки зрозуміла тарифікація, що масштабується разом із вашою практикою.",
  },
  billing: {
    monthly: "Місяць",
    yearly: "Рік",
    saveBadge: "Заощаджуйте 20%",
    billedAnnually: "рахунок виставляється щорічно",
  },
  plans: [
    {
      name: "Безкоштовний",
      description: "Для успішного старту",
      monthlyPrice: "0 ₴",
      yearlyPrice: "0 ₴",
      period: "/міс",
      popular: false,
      features: [
        "До 5 активних справ",
        "1 користувач",
        "Сховище документів (1 ГБ)",
        "Базовий облік часу",
        "Підтримка спільноти",
        "Доступ до мобільного додатка",
      ],
      cta: "Почати безкоштовно",
      href: routes.demo,
    },
    {
      name: "Соло",
      description: "Для незалежних адвокатів",
      monthlyPrice: "1 999 ₴",
      yearlyPrice: "1 599 ₴",
      period: "/міс",
      popular: false,
      features: [
        "Безліміт справ",
        "Портал клієнта",
        "Сховище документів (10 ГБ)",
        "Облік часу та рахунки",
        "Підтримка через email",
        "Доступ до мобільного додатка",
      ],
      cta: "Спробувати безкоштовно",
      href: routes.demo,
    },
    {
      name: "Фірма",
      description: "Для юридичних компаній, що ростуть",
      monthlyPrice: "3 999 ₴",
      yearlyPrice: "3 199 ₴",
      period: "/міс",
      popular: true,
      features: [
        "Усе, що в плані Соло",
        "Необмежена кількість учасників",
        "Сховище документів (100 ГБ)",
        "Інструменти для командної роботи",
        "Автоматизація процесів",
        "Аналітика та звітність фірми",
        "Пріоритетна підтримка",
        "Кастомні інтеграції",
      ],
      cta: "Спробувати безкоштовно",
      href: routes.demo,
    },
    {
      name: "Корпоративний",
      description: "Для великих організацій",
      monthlyPrice: "Індивідуально",
      yearlyPrice: "Індивідуально",
      period: "",
      popular: false,
      features: [
        "Усе, що в плані Фірма",
        "Необмежене сховище",
        "SSO/SAML автентифікація",
        "Розширений контроль безпеки",
        "Персональний менеджер",
        "Індивідуальний SLA",
        "Можливість On-premise розгортання",
        "Доступ до API",
      ],
      cta: "Зв'язатися з нами",
      href: routes.demo,
    },
  ],
  comparison: {
    title: "Детальне порівняння тарифів",
    description:
      "Дізнайтеся точно, що входить до кожного плану, щоб обрати найкращий варіант для вашої практики.",
    heads: {
      features: "Можливості",
      free: "Free",
      solo: "Solo",
      firm: "Firm",
      enterprise: "Enterprise",
    },
    categories: [
      {
        category: "Справи та Клієнти",
        features: [
          {
            name: "Активні справи",
            free: "5",
            solo: "Безліміт",
            firm: "Безліміт",
            enterprise: "Безліміт",
          },
          {
            name: "Профілі клієнтів",
            free: "10",
            solo: "Безліміт",
            firm: "Безліміт",
            enterprise: "Безліміт",
          },
          {
            name: "Клієнтський портал",
            free: false,
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Шаблони справ",
            free: false,
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Кастомні поля",
            free: false,
            solo: true,
            firm: true,
            enterprise: true,
          },
        ],
      },
      {
        category: "Документи",
        features: [
          {
            name: "Сховище",
            free: "1 ГБ",
            solo: "10 ГБ",
            firm: "100 ГБ",
            enterprise: "Безліміт",
          },
          {
            name: "Шаблони документів",
            free: "3",
            solo: "Безліміт",
            firm: "Безліміт",
            enterprise: "Безліміт",
          },
          {
            name: "Електронні підписи",
            free: false,
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Історія версій",
            free: false,
            solo: "30 днів",
            firm: "1 рік",
            enterprise: "Безліміт",
          },
          {
            name: "Розширений пошук",
            free: false,
            solo: true,
            firm: true,
            enterprise: true,
          },
        ],
      },
      {
        category: "Час та Рахунки",
        features: [
          {
            name: "Облік часу",
            free: "Базовий",
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Виставлення рахунків",
            free: false,
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Онлайн оплати",
            free: false,
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Відстеження витрат",
            free: false,
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Довірче управління (Trust)",
            free: false,
            solo: false,
            firm: true,
            enterprise: true,
          },
          {
            name: "Фінансові звіти",
            free: false,
            solo: "Базові",
            firm: "Розширені",
            enterprise: "Кастомні",
          },
        ],
      },
      {
        category: "Команда та Співпраця",
        features: [
          {
            name: "Учасники команди",
            free: "1",
            solo: "1",
            firm: "Безліміт",
            enterprise: "Безліміт",
          },
          {
            name: "Права доступу",
            free: false,
            solo: false,
            firm: true,
            enterprise: true,
          },
          {
            name: "Призначення завдань",
            free: false,
            solo: false,
            firm: true,
            enterprise: true,
          },
          {
            name: "Командний календар",
            free: false,
            solo: false,
            firm: true,
            enterprise: true,
          },
          {
            name: "Стрічка активності",
            free: false,
            solo: false,
            firm: true,
            enterprise: true,
          },
        ],
      },
      {
        category: "Безпека та Відповідність",
        features: [
          {
            name: "Шифрування даних",
            free: true,
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Двофакторна автентифікація",
            free: true,
            solo: true,
            firm: true,
            enterprise: true,
          },
          {
            name: "Журнали аудиту",
            free: false,
            solo: false,
            firm: true,
            enterprise: true,
          },
          {
            name: "SSO/SAML",
            free: false,
            solo: false,
            firm: false,
            enterprise: true,
          },
          {
            name: "Політики безпеки",
            free: false,
            solo: false,
            firm: false,
            enterprise: true,
          },
          {
            name: "Звіти про відповідність",
            free: false,
            solo: false,
            firm: false,
            enterprise: true,
          },
        ],
      },
      {
        category: "Підтримка та Послуги",
        features: [
          {
            name: "Підтримка",
            free: "Спільнота",
            solo: "Email",
            firm: "Пріоритетна",
            enterprise: "Персональна",
          },
          {
            name: "Навчання (Onboarding)",
            free: false,
            solo: "Самостійно",
            firm: "З ментором",
            enterprise: "Повний супровід",
          },
          {
            name: "Тренінги",
            free: false,
            solo: false,
            firm: "Групові",
            enterprise: "Кастомні",
          },
          {
            name: "Доступ до API",
            free: false,
            solo: false,
            firm: false,
            enterprise: true,
          },
          {
            name: "Кастомні інтеграції",
            free: false,
            solo: false,
            firm: true,
            enterprise: true,
          },
        ],
      },
    ],
  },
  faq: {
    title: "Часті запитання",
    description: "Усе, що вам потрібно знати про наші тарифи та плани.",
    items: [
      {
        question: "Чи можу я спробувати систему перед покупкою?",
        answer:
          "Так. Усі плани включають 14-денний безкоштовний пробний період з повним доступом до функцій. Кредитна картка не потрібна.",
      },
      {
        question: "Що станеться з моїми даними, якщо я скасую підписку?",
        answer:
          "Ваші дані залишаться доступними протягом 30 днів після скасування. Ви можете експортувати всю свою інформацію в будь-який час.",
      },
      {
        question: "Чи пропонуєте ви знижки при річній оплаті?",
        answer:
          "Так. При оплаті за рік ви отримуєте знижку 20% порівняно з місячною оплатою.",
      },
      {
        question: "Чи можу я змінити тарифний план пізніше?",
        answer:
          "Звичайно. Ви можете підвищити або понизити свій тариф у будь-який час. Зміни вступлять в силу з наступного платіжного циклу.",
      },
      {
        question: "Чи є обмеження на кількість справ?",
        answer:
          "Безкоштовний план обмежений 5 активними справами. Усі платні плани включають необмежену кількість справ.",
      },
      {
        question: "Які методи оплати ви приймаєте?",
        answer:
          "Ми приймаємо всі основні кредитні картки, а також банківські перекази за виставленим рахунком для річних планів.",
      },
    ],
  },
  cta: {
    title: "Залишилися запитання?",
    description:
      "Наша команда з радістю допоможе вам обрати найкращий тарифний план для вашої практики.",
    button: {
      text: "Зв'язатися з відділом продажів",
      href: routes.demo,
    },
  },
};
