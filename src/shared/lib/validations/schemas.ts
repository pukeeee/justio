import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const InvitationStatusSchema = z.enum([
  "pending",
  "accepted",
  "expired",
  "cancelled",
]);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

export const UserRoleSchema = z.enum([
  "owner",
  "admin",
  "manager",
  "user",
  "guest",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const WorkspaceUserStatusSchema = z.enum([
  "pending",
  "active",
  "suspended",
]);
export type WorkspaceUserStatus = z.infer<typeof WorkspaceUserStatusSchema>;

export const SubscriptionTierSchema = z.enum([
  "free",
  "starter",
  "pro",
  "enterprise",
]);
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

export const SubscriptionStatusSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "cancelled",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const ContactStatusSchema = z.enum([
  "new",
  "qualified",
  "customer",
  "lost",
]);
export type ContactStatus = z.infer<typeof ContactStatusSchema>;

export const CompanyStatusSchema = z.enum(["lead", "active", "inactive"]);
export type CompanyStatus = z.infer<typeof CompanyStatusSchema>;

export const DealStatusSchema = z.enum(["open", "won", "lost", "cancelled"]);
export type DealStatus = z.infer<typeof DealStatusSchema>;

export const TaskTypeSchema = z.enum(["call", "meeting", "email", "todo"]);
export type TaskType = z.infer<typeof TaskTypeSchema>;

export const TaskStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const ActivityTypeSchema = z.enum([
  "note",
  "call",
  "email",
  "status_change",
  "file_upload",
  "created",
  "updated",
]);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const PaymentStatusSchema = z.enum([
  "pending",
  "completed",
  "failed",
  "refunded",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ============================================================================
// BASE SCHEMAS (Common patterns)
// ============================================================================

export const UUIDSchema = z.uuid();
export const EmailSchema = z.email().min(5).max(255);
export const PhoneSchema = z
  .string()
  .regex(/^\+380\d{9}$/, "Невірний формат номера телефону");
export const URLSchema = z.url().optional();
export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug може містити тільки малі літери, цифри та дефіс")
  .min(2)
  .max(50);

// JSONB schemas
export const PhoneEntrySchema = z.object({
  type: z.enum(["mobile", "work", "home"]),
  number: PhoneSchema,
  primary: z.boolean().optional(),
});

export const EmailEntrySchema = z.object({
  type: z.enum(["work", "personal", "other"]),
  email: EmailSchema,
  primary: z.boolean().optional(),
});

export const PipelineStageSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  order: z.number().int().min(1),
  probability: z.number().int().min(0).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Невірний формат кольору"),
});

// ============================================================================
// WORKSPACE SCHEMAS
// ============================================================================

export const WorkspaceSettingsSchema = z.object({
  visibility_mode: z.enum(["all", "team", "own"]).default("all"),
  default_currency: z.string().default("UAH"),
  timezone: z.string().default("Europe/Kyiv"),
  date_format: z.string().default("DD.MM.YYYY"),
});

export const WorkspaceSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(2).max(100),
  slug: SlugSchema,
  owner_id: UUIDSchema,
  settings: WorkspaceSettingsSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
});

export const CreateWorkspaceSchema = WorkspaceSchema.pick({
  name: true,
}).extend({
  settings: WorkspaceSettingsSchema.partial().optional(),
});

export const UpdateWorkspaceSchema = WorkspaceSchema.pick({
  name: true,
  settings: true,
}).partial();

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspace = z.infer<typeof UpdateWorkspaceSchema>;

// ============================================================================
// WORKSPACE USERS
// ============================================================================

export const WorkspaceUserSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  user_id: UUIDSchema,
  role: UserRoleSchema,
  status: WorkspaceUserStatusSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const UpdateUserRoleSchema = z.object({
  role: UserRoleSchema,
});

export type WorkspaceUser = z.infer<typeof WorkspaceUserSchema>;

// ============================================================================
// WORKSPACE INVITATIONS
// ============================================================================

export const WorkspaceInvitationSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  email: EmailSchema,
  role: UserRoleSchema,
  token: z.string().length(64), // Токен тепер hex 64 символи
  invited_by: UUIDSchema,
  status: InvitationStatusSchema,
  expires_at: z.coerce.date(),
  accepted_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

// Схема для створення нового запрошення (для API)
export const CreateWorkspaceInvitationSchema = z.object({
  workspace_id: UUIDSchema,
  email: EmailSchema,
  role: UserRoleSchema.default("user"),
});

// Схема для прийняття запрошення
export const AcceptInvitationSchema = z.object({
  token: z.string().length(64, "Недійсний формат токена"),
});

// Схема для скасування/видалення запрошення
export const CancelInvitationSchema = z.object({
  invitation_id: UUIDSchema,
});

// Розширена схема для відображення в UI
export const InvitationWithDetailsSchema = WorkspaceInvitationSchema.extend({
  workspace: z.object({
    name: z.string(),
    slug: z.string(),
  }),
  inviter: z.object({
    full_name: z.string().nullable(),
    email: EmailSchema,
  }),
});

export type WorkspaceInvitation = z.infer<typeof WorkspaceInvitationSchema>;
export type CreateWorkspaceInvitation = z.infer<
  typeof CreateWorkspaceInvitationSchema
>;
export type AcceptInvitation = z.infer<typeof AcceptInvitationSchema>;
export type CancelInvitation = z.infer<typeof CancelInvitationSchema>;
export type InvitationWithDetails = z.infer<typeof InvitationWithDetailsSchema>;

// ============================================================================
// SUBSCRIPTION & BILLING
// ============================================================================

export const SubscriptionSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  tier: SubscriptionTierSchema,
  status: SubscriptionStatusSchema,
  billing_period: z.enum(["monthly", "annual"]).nullable(),
  current_period_start: z.iso.datetime(),
  current_period_end: z.iso.datetime(),
  trial_ends_at: z.iso.datetime().nullable(),
  cancelled_at: z.iso.datetime().nullable(),
  payment_provider: z.enum(["paddle", "fondy", "stripe"]).nullable(),
  external_subscription_id: z.string().nullable(),
  enabled_modules: z.array(z.string()),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const WorkspaceQuotaSchema = z.object({
  workspace_id: UUIDSchema,
  max_users: z.number().int().positive(),
  max_contacts: z.number().int().positive(),
  max_deals: z.number().int().positive(),
  max_storage_mb: z.number().int().positive(),
  current_users: z.number().int().nonnegative(),
  current_contacts: z.number().int().nonnegative(),
  current_deals: z.number().int().nonnegative(),
  current_storage_mb: z.number().int().nonnegative(),
  updated_at: z.iso.datetime(),
});

export const PaymentSchema = z.object({
  id: UUIDSchema,
  subscription_id: UUIDSchema,
  workspace_id: UUIDSchema,
  amount: z.number().nonnegative(),
  currency: z.string(),
  status: PaymentStatusSchema,
  payment_provider: z.string(),
  external_payment_id: z.string().nullable(),
  invoice_url: z.url().nullable(),
  created_at: z.iso.datetime(),
  completed_at: z.iso.datetime().nullable(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type WorkspaceQuota = z.infer<typeof WorkspaceQuotaSchema>;
export type Payment = z.infer<typeof PaymentSchema>;

// ============================================================================
// CONTACTS & COMPANIES
// ============================================================================

export const ContactSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  company_id: UUIDSchema.nullable(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  middle_name: z.string().max(50).optional().nullable(),
  full_name: z.string(), // Generated column
  phones: z.array(PhoneEntrySchema).default([]),
  emails: z.array(EmailEntrySchema).default([]),
  position: z.string().max(100).optional().nullable(),
  status: ContactStatusSchema,
  tags: z.array(z.string()).default([]),
  source: z.string().max(100).optional().nullable(),
  owner_id: UUIDSchema.nullable(),
  custom_fields: z.record(z.string(), z.unknown()).default({}),
  created_by: UUIDSchema.nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
});

export const CreateContactSchema = ContactSchema.pick({
  first_name: true,
  last_name: true,
  middle_name: true,
  phones: true,
  emails: true,
  position: true,
  status: true,
  tags: true,
  source: true,
  custom_fields: true,
}).extend({
  company_id: UUIDSchema.optional().nullable(),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export type Contact = z.infer<typeof ContactSchema>;
export type CreateContact = z.infer<typeof CreateContactSchema>;
export type UpdateContact = z.infer<typeof UpdateContactSchema>;

// Companies
export const CompanySchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  name: z.string().min(1).max(200),
  legal_name: z.string().max(200).optional().nullable(),
  edrpou: z.string().max(20).optional().nullable(),
  website: URLSchema.nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: EmailSchema.optional().nullable(),
  address: z.record(z.string(), z.unknown()).default({}),
  status: CompanyStatusSchema,
  tags: z.array(z.string()).default([]),
  source: z.string().max(100).optional().nullable(),
  owner_id: UUIDSchema.nullable(),
  custom_fields: z.record(z.string(), z.unknown()).default({}),
  created_by: UUIDSchema.nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
});

export const CreateCompanySchema = CompanySchema.pick({
  name: true,
  legal_name: true,
  edrpou: true,
  website: true,
  phone: true,
  email: true,
  address: true,
  status: true,
  tags: true,
  source: true,
  custom_fields: true,
});

export const UpdateCompanySchema = CreateCompanySchema.partial();

export type Company = z.infer<typeof CompanySchema>;
export type CreateCompany = z.infer<typeof CreateCompanySchema>;
export type UpdateCompany = z.infer<typeof UpdateCompanySchema>;

// ============================================================================
// DEALS & PIPELINES
// ============================================================================

export const PipelineSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  name: z.string().min(1).max(100),
  is_default: z.boolean(),
  stages: z.array(PipelineStageSchema),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const DealSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  pipeline_id: UUIDSchema,
  stage_id: z.string(),
  title: z.string().min(1).max(200),
  amount: z.number().nonnegative().default(0),
  currency: z.string().default("UAH"),
  probability: z.number().int().min(0).max(100).default(50),
  contact_id: UUIDSchema.nullable(),
  company_id: UUIDSchema.nullable(),
  owner_id: UUIDSchema,
  expected_close_date: z.iso.date().nullable(),
  actual_close_date: z.iso.date().nullable(),
  status: DealStatusSchema,
  lost_reason: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.string(), z.unknown()).default({}),
  created_by: UUIDSchema.nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
});

export const CreateDealSchema = DealSchema.pick({
  pipeline_id: true,
  stage_id: true,
  title: true,
  amount: true,
  currency: true,
  probability: true,
  contact_id: true,
  company_id: true,
  expected_close_date: true,
  tags: true,
  custom_fields: true,
});

export const UpdateDealSchema = CreateDealSchema.partial().extend({
  stage_id: z.string().optional(),
  status: DealStatusSchema.optional(),
  lost_reason: z.string().max(500).optional().nullable(),
});

export const DealStageHistorySchema = z.object({
  id: UUIDSchema,
  deal_id: UUIDSchema,
  from_stage_id: z.string().nullable(),
  to_stage_id: z.string(),
  user_id: UUIDSchema,
  duration_seconds: z.number().int().nullable(),
  created_at: z.iso.datetime(),
});

export type Pipeline = z.infer<typeof PipelineSchema>;
export type Deal = z.infer<typeof DealSchema>;
export type CreateDeal = z.infer<typeof CreateDealSchema>;
export type UpdateDeal = z.infer<typeof UpdateDealSchema>;
export type DealStageHistory = z.infer<typeof DealStageHistorySchema>;

// Deal Products
export const DealProductSchema = z.object({
  id: UUIDSchema,
  deal_id: UUIDSchema,
  product_id: UUIDSchema.nullable(),
  name: z.string().min(1).max(200),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  discount: z.number().min(0).max(100).default(0),
  total: z.number().nonnegative(), // Computed
  notes: z.string().max(500).optional().nullable(),
});

export const CreateDealProductSchema = DealProductSchema.pick({
  product_id: true,
  name: true,
  quantity: true,
  price: true,
  discount: true,
  notes: true,
});

export type DealProduct = z.infer<typeof DealProductSchema>;
export type CreateDealProduct = z.infer<typeof CreateDealProductSchema>;

// ============================================================================
// PRODUCTS & SERVICES
// ============================================================================

export const ProductCategorySchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  parent_id: UUIDSchema.nullable(),
  name: z.string(),
  order_index: z.number().int().default(0),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const ProductSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  category_id: UUIDSchema.nullable(),
  name: z.string().min(1).max(200),
  sku: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  price: z.number().nonnegative(),
  currency: z.string().default("UAH"),
  unit: z.string().max(20).default("шт."),
  is_active: z.boolean().default(true),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
});

export const ProductPriceHistorySchema = z.object({
  id: UUIDSchema,
  product_id: UUIDSchema,
  old_price: z.number().nonnegative().nullable(),
  new_price: z.number().nonnegative(),
  changed_by: UUIDSchema.nullable(),
  changed_at: z.iso.datetime(),
});

export const CreateProductSchema = ProductSchema.pick({
  category_id: true,
  name: true,
  sku: true,
  description: true,
  price: true,
  currency: true,
  unit: true,
  is_active: true,
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductPriceHistory = z.infer<typeof ProductPriceHistorySchema>;

// ============================================================================
// TASKS
// ============================================================================

export const TaskSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  task_type: TaskTypeSchema,
  created_by: UUIDSchema,
  assigned_to: UUIDSchema,
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  due_date: z.iso.datetime(),
  completed_at: z.iso.datetime().nullable(),
  reminders: z.array(z.unknown()).default([]),
  contact_id: UUIDSchema.nullable(),
  deal_id: UUIDSchema.nullable(),
  result: z.string().max(1000).optional().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
});

export const CreateTaskSchema = TaskSchema.pick({
  title: true,
  description: true,
  task_type: true,
  assigned_to: true,
  priority: true,
  due_date: true,
  contact_id: true,
  deal_id: true,
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: TaskStatusSchema.optional(),
  result: z.string().max(1000).optional(),
  completed_at: z.iso.datetime().optional().nullable(),
});

export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;

// ============================================================================
// ACTIVITIES
// ============================================================================

export const ActivitySchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  activity_type: ActivityTypeSchema,
  content: z.string().max(2000).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  contact_id: UUIDSchema.nullable(),
  deal_id: UUIDSchema.nullable(),
  company_id: UUIDSchema.nullable(),
  task_id: UUIDSchema.nullable(),
  user_id: UUIDSchema,
  created_at: z.iso.datetime(),
});

export const CreateActivitySchema = ActivitySchema.pick({
  activity_type: true,
  content: true,
  metadata: true,
  contact_id: true,
  deal_id: true,
  company_id: true,
  task_id: true,
});

export type Activity = z.infer<typeof ActivitySchema>;
export type CreateActivity = z.infer<typeof CreateActivitySchema>;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const NotificationSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  user_id: UUIDSchema,
  type: z.string(),
  title: z.string().min(1).max(200),
  message: z.string().max(1000).optional().nullable(),
  link: z.string().max(500).optional().nullable(),
  is_read: z.boolean().default(false),
  read_at: z.iso.datetime().nullable(),
  created_at: z.iso.datetime(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// ============================================================================
// FILES
// ============================================================================

export const FileSchema = z.object({
  id: UUIDSchema,
  workspace_id: UUIDSchema,
  name: z.string().min(1).max(255),
  original_name: z.string().min(1).max(255),
  size_bytes: z.number().int().nonnegative(),
  mime_type: z.string(),
  storage_path: z.string(),
  contact_id: UUIDSchema.nullable(),
  deal_id: UUIDSchema.nullable(),
  company_id: UUIDSchema.nullable(),
  uploaded_by: UUIDSchema,
  uploaded_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
});

export type File = z.infer<typeof FileSchema>;

// ============================================================================
// INTEGRATIONS
// ============================================================================

export const IntegrationsSchema = z.object({
  workspace_id: UUIDSchema,
  nova_poshta_api_key: z.string().nullable(),
  nova_poshta_settings: z.record(z.string(), z.unknown()).default({}),
  smtp_settings: z.record(z.string(), z.unknown()).default({}),
  sms_settings: z.record(z.string(), z.unknown()).default({}),
  updated_at: z.iso.datetime(),
});

export type Integrations = z.infer<typeof IntegrationsSchema>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export const ApiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.array(z.string())).optional(),
});

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// PAGINATION
// ============================================================================

export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total_pages: z.number().int().nonnegative(),
  });

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

export const ContactFilterSchema = z.object({
  status: ContactStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
  owner_id: UUIDSchema.optional(),
  company_id: UUIDSchema.optional(),
  search: z.string().optional(),
});

export const DealFilterSchema = z.object({
  status: DealStatusSchema.optional(),
  stage_id: z.string().optional(),
  pipeline_id: UUIDSchema.optional(),
  owner_id: UUIDSchema.optional(),
  contact_id: UUIDSchema.optional(),
  company_id: UUIDSchema.optional(),
  min_amount: z.number().optional(),
  max_amount: z.number().optional(),
  search: z.string().optional(),
});

export const TaskFilterSchema = z.object({
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  task_type: TaskTypeSchema.optional(),
  assigned_to: UUIDSchema.optional(),
  due_before: z.iso.datetime().optional(),
  due_after: z.iso.datetime().optional(),
});

export type ContactFilter = z.infer<typeof ContactFilterSchema>;
export type DealFilter = z.infer<typeof DealFilterSchema>;
export type TaskFilter = z.infer<typeof TaskFilterSchema>;
