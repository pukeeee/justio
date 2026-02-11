import { routes } from "@/shared/routes/main-routes";

export const footerContent = {
  homeRoute: routes.home,
  brandDescription:
    "Сучасна CRM-система, створена спеціально для юристів. Керуйте справами, клієнтами та виставленням рахунків з упевненістю.",
  copyrightText: `© ${new Date().getFullYear()} Justio CRM. Всі права захищені.`,
  socialLinks: {
    twitter: {
      ariaLabel: "Twitter",
    },
    linkedin: {
      ariaLabel: "LinkedIn",
    },
    github: {
      ariaLabel: "GitHub",
    },
  },
  links: {
    product: {
      title: "Продукт",
      links: [
        { label: "Огляд", href: routes.product.index },
        { label: "Управління справами", href: routes.product.caseManagement },
        { label: "Управління клієнтами", href: routes.product.clients },
        { label: "Документи", href: routes.product.documents },
        { label: "Виставлення рахунків", href: routes.product.billing },
        { label: "Команда", href: routes.product.team },
      ],
    },
    solutions: {
      title: "Рішення",
      links: [
        { label: "Одинокі практикуючі", href: routes.solutions.soloLawyers },
        { label: "Юридичні фірми", href: routes.solutions.lawFirms },
        { label: "Корпоративні", href: routes.solutions.enterprise },
      ],
    },
    resources: {
      title: "Ресурси",
      links: [
        { label: "Документація", href: routes.resources.docs },
        { label: "Посібники", href: routes.resources.guides },
        { label: "Блог", href: routes.resources.blog },
        { label: "Журнал змін", href: routes.resources.releases },
      ],
    },
    company: {
      title: "Про компанію",
      links: [
        { label: "Про нас", href: routes.company.about },
        { label: "Вакансії", href: routes.company.careers },
        { label: "Контакти", href: routes.company.contact },
        { label: "Безпека", href: routes.security },
      ],
    },
    legal: {
      title: "Правові питання",
      links: [
        { label: "Політика конфіденційності", href: routes.legal.privacy },
        { label: "Умови надання послуг", href: routes.legal.terms },
        { label: "Політика щодо файлів cookie", href: routes.legal.cookies },
      ],
    },
  },
};
