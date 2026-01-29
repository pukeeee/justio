import { User, Scale, Building2 } from "lucide-react";
import { routes } from "@/shared/config/routes";

export const solutionsContent = {
  header: {
    tagline: "Рішення",
    title: "Створено для вашого способу практики",
    description:
      "Незалежно від того, чи ви працюєте самостійно чи є частиною великої юридичної команди, Justio CRM адаптується до ваших потреб.",
  },
  audiences: [
    {
      icon: User,
      title: "Одинокі адвокати",
      description:
        "Ведіть всю свою практику з однієї платформи. Витрачайте менше часу на адміністрування, більше часу на практику права.",
      href: routes.solutions.soloLawyers,
    },
    {
      icon: Scale,
      title: "Юридичні фірми",
      description:
        "Розширюйте свої операції без збільшення накладних витрат. Інструменти співпраці, створені для юридичних команд.",
      href: routes.solutions.lawFirms,
    },
    {
      icon: Building2,
      title: "Корпоративне право",
      description:
        "Безпека корпоративного рівня, єдиний вхід та настроювані робочі процеси для великих юридичних департаментів.",
      href: routes.solutions.enterprise,
    },
  ],
  footer: {
    title: "Дізнатися більше",
  },
};
