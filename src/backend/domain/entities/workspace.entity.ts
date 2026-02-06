import { SubscriptionTier } from '../value-objects/subscription-tier.vo';
import { WorkspaceSlug } from '../value-objects/workspace-slug.vo';

/**
 * Налаштування робочого простору.
 */
// ... (WorkspaceSettings remains same)
export class WorkspaceSettings {
  constructor(
    public readonly visibilityMode: 'all' | 'private' = 'all',
    public readonly defaultCurrency: string = 'UAH',
    public readonly timezone: string = 'Europe/Kyiv',
    public readonly dateFormat: string = 'DD.MM.YYYY'
  ) {}

  static default(): WorkspaceSettings {
    return new WorkspaceSettings();
  }
}

/**
 * Сутність Робочого простору (Workspace).
 * Групує ресурси (контакти, справи) та користувачів.
 */
export class Workspace {
  private constructor(
    public readonly id: string,
    private _name: string,
    public readonly slug: WorkspaceSlug,
    public readonly ownerId: string,
    private _subscriptionTier: SubscriptionTier,
    private _settings: WorkspaceSettings,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    private _deletedAt: Date | null
  ) {}

  static create(props: {
    id?: string;
    name: string;
    slug: string | WorkspaceSlug;
    ownerId: string;
    tier?: SubscriptionTier;
    settings?: WorkspaceSettings;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }): Workspace {
    const slug = typeof props.slug === 'string' 
      ? WorkspaceSlug.create(props.slug) 
      : props.slug;

    return new Workspace(
      props.id ?? crypto.randomUUID(),
      props.name,
      slug,
      props.ownerId,
      props.tier ?? SubscriptionTier.FREE,
      props.settings ?? WorkspaceSettings.default(),
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
      props.deletedAt ?? null
    );
  }

  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }

  canAddUser(currentUserCount: number): boolean {
    return this._subscriptionTier.canAddUser(currentUserCount);
  }

  /**
   * Оновлює дані воркспейсу.
   */
  update(props: { name?: string; settings?: WorkspaceSettings }): void {
    if (props.name) {
      const trimmedName = props.name.trim();
      if (trimmedName.length < 2) throw new Error('Назва занадто коротка');
      this._name = trimmedName;
    }
    if (props.settings) {
      this._settings = props.settings;
    }
  }

  /**
   * Позначає воркспейс як видалений.
   */
  markAsDeleted(): void {
    this._deletedAt = new Date();
  }

  /**
   * Відновлює видалений воркспейс.
   */
  restore(): void {
    this._deletedAt = null;
  }

  get name(): string {
    return this._name;
  }

  get subscriptionTier(): SubscriptionTier {
    return this._subscriptionTier;
  }

  get settings(): WorkspaceSettings {
    return this._settings;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }
}
