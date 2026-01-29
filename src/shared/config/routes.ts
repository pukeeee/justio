export const routes = {
  home: "/",
  product: {
    index: "/product",
    caseManagement: "/product/case-management",
    clients: "/product/clients",
    documents: "/product/documents",
    billing: "/product/billing",
    team: "/product/team",
  },
  solutions: {
    soloLawyers: "/solutions/solo-lawyers",
    lawFirms: "/solutions/law-firms",
    enterprise: "/solutions/enterprise",
  },
  resources: {
    docs: "/docs",
    guides: "/resources/guides",
    blog: "/resources/blog",
    changelog: "/resources/changelog",
    releases: "/resources/releases",
  },
  company: {
    about: "/company/about",
    careers: "/company/careers",
    contact: "/company/contact",
  },
  legal: {
    privacy: "/privacy",
    terms: "/terms",
    cookies: "/cookies",
  },
  security: "/security",
  demo: "/demo",
  pricing: "/pricing",
};

export const privatRoutes = {
  user: {
    profile: "/user/profile",
    workspace: "/user/workspace",
    billing: "/user/billing",
    settings: "/user/settings",
  },
};
