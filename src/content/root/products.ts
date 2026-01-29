import { routes } from "@/shared/config/routes";

export const productsContent = {
  header: {
    tagline: "Продукт",
    title: "Усе необхідне, нічого зайвого",
    description:
      "Сфокусований набір інструментів, розроблений для того, як насправді працюють юридичні фахівці.",
  },
  features: [
    {
      title: "Управління справами",
      description:
        "Відстежуйте кожну справу від надходження до вирішення. Терміни, завдання та судові дні в одному вигляді.",
      href: routes.product.caseManagement,
    },
    {
      title: "Портал клієнтів",
      description:
        "Безпечна комунікація з клієнтами. Спільний доступ до документів, збирання підписів та інформування всіх учасників процесу.",
      href: routes.product.clients,
    },
    {
      title: "Управління документами",
      description:
        "Зберігання, організація та контроль версій усіх ваших юридичних документів. Повнотекстовий пошук по всьому обсягу.",
      href: routes.product.documents,
    },
    {
      title: "Виставлення рахунків та оплати",
      description:
        "Облік часу, довірче обслуговування та професійні рахунки. Отримуйте оплату швидше.",
      href: routes.product.billing,
    },
    {
      title: "Співпраця в команді",
      description:
        "Призначайте завдання, діліться справами та тримайте всю команду в курсі справи щодо кожного випадку.",
      href: routes.product.team,
    },
  ],
  exploreAllFeatures: {
    text: "Переглянути всі функції",
    href: routes.product.index,
  },
  productCard: {
    text: "Переглянути",
  },
};
