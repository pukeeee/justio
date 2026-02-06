import {
  Workspace,
  WorkspaceSettings,
} from "@/backend/domain/entities/workspace.entity";
import { SubscriptionTier } from "@/backend/domain/value-objects/subscription-tier.vo";

type DbWorkspace = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  tier: string;
  settings: unknown;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type WorkspaceSettingsJson = {
  visibility_mode?: string;
  default_currency?: string;
  timezone?: string;
  date_format?: string;
};

export class WorkspaceMapper {
  static toDomain(raw: DbWorkspace): Workspace {
    // Безпечне приведення типу
    const s = (raw.settings as WorkspaceSettingsJson) || {};

    const domainSettings = new WorkspaceSettings(
      s.visibility_mode === "all" || s.visibility_mode === "private"
        ? s.visibility_mode
        : undefined,
      s.default_currency,
      s.timezone,
      s.date_format,
    );

    return Workspace.create({
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      ownerId: raw.ownerId,
      tier: SubscriptionTier.fromName(raw.tier),
      settings: domainSettings,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(domain: Workspace) {
    return {
      id: domain.id,
      name: domain.name,
      slug: domain.slug.value,
      ownerId: domain.ownerId,
      tier: domain.subscriptionTier.name as "free" | "starter" | "pro" | "enterprise",
      settings: {
        visibility_mode: domain.settings.visibilityMode,
        default_currency: domain.settings.defaultCurrency,
        timezone: domain.settings.timezone,
        date_format: domain.settings.dateFormat,
      },
      createdAt: domain.createdAt,
      updatedAt: new Date(),
      deletedAt: domain.deletedAt,
    };
  }
}
