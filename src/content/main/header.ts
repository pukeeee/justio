import { routes } from "@/shared/routes/main-routes";

export const headerContent = {
  homeRoute: routes.home,
  logoText: "Justio CRM",
  nav: {
    product: {
      title: "Продукт",
      viewAllFeatures: "Переглянути всі функції →",
      viewAllFeaturesRoute: routes.product.index,
      links: [
        {
          title: "Управління справами",
          description: "Відстежуйте справи, терміни та судові засідання",
          href: routes.product.caseManagement,
        },
        {
          title: "Клієнтський портал",
          description: "Безпечний центр комунікації з клієнтами",
          href: routes.product.clients,
        },
        {
          title: "Управління документами",
          description: "Зберігання та організація юридичних документів",
          href: routes.product.documents,
        },
        {
          title: "Виставлення рахунків",
          description: "Облік часу та створення рахунків",
          href: routes.product.billing,
        },
        {
          title: "Співпраця в команді",
          description: "Призначення завдань та співпраця",
          href: routes.product.team,
        },
      ],
    },
    solutions: {
      title: "Рішення",
      links: [
        {
          title: "Соло-юристи",
          description: "Усе необхідне для ведення вашої практики",
          href: routes.solutions.soloLawyers,
        },
        {
          title: "Юридичні фірми",
          description:
            "Розширюйте свою фірму за допомогою потужних інструментів",
          href: routes.solutions.lawFirms,
        },
        {
          title: "Корпоративна юриспруденція",
          description: "Корпоративний рівень безпеки та відповідності",
          href: routes.solutions.enterprise,
        },
      ],
    },
    pricing: {
      title: "Ціни",
      route: routes.pricing,
    },
    security: {
      title: "Безпека",
      route: routes.security,
    },
    resources: {
      title: "Ресурси",
      links: [
        {
          title: "Документація",
          description: "Посібники та довідник API",
          href: routes.resources.docs,
        },
        {
          title: "Блог",
          description: "Інсайти та найкращі практики",
          href: routes.resources.blog,
        },
        {
          title: "Примітки до випуску",
          description: "Останні оновлення та функції",
          href: routes.resources.releases,
        },
      ],
    },
    company: {
      title: "Про компанію",
      links: [
        {
          title: "Про нас",
          description: "Наша місія та команда",
          href: routes.company.about,
        },
        {
          title: "Вакансії",
          description: "Долучитися до нашої команди",
          href: routes.company.careers,
        },
        {
          title: "Контакти",
          description: "Зв'яжіться з нами",
          href: routes.company.contact,
        },
      ],
    },
  },
  auth: {
    login: "Увійти",
    requestDemo: "Запитати демо",
    dashboard: "Дашборд",
    demoRoute: routes.demo,
    dashboardRoute: "/user/workspace", // This route isn't in the main routes config
  },
};
