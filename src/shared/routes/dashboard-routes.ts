export const dashboardRoutes = {
  root: (slug: string) => `/dashboard/${slug}`,
  clients: (slug: string) => `/dashboard/${slug}/clients`,
  client: (slug: string, id: string) => `/dashboard/${slug}/clients/${id}`,
  bin: (slug: string) => `/dashboard/${slug}/bin`,
  cases: (slug: string) => `/dashboard/${slug}/cases`,
  documents: (slug: string) => `/dashboard/${slug}/documents`,
  calendar: (slug: string) => `/dashboard/${slug}/calendar`,
  finance: (slug: string) => `/dashboard/${slug}/finance`,
  inbox: (slug: string) => `/dashboard/${slug}/inbox`,
  settings: (slug: string) => `/dashboard/${slug}/settings`,
  knowledge: (slug: string) => `/dashboard/${slug}/knowledge`,
};
