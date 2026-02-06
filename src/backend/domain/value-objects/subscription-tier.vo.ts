/**
 * Перелік можливостей (фіч), які можуть бути доступні у підписці.
 */
export enum Feature {
  BASIC_CRM = 'basic_crm',
  ANALYTICS = 'analytics',
  API_ACCESS = 'api_access',
  CUSTOM_FIELDS = 'custom_fields',
  AUTOMATIONS = 'automations'
}

type TierLimits = {
  maxUsers: number;
  maxContacts: number;
  maxDeals: number;
  maxStorageMb: number;
  features: Feature[];
};

/**
 * Об'єкт-значення для Рівня підписки.
 */
export class SubscriptionTier {
  static readonly FREE = new SubscriptionTier('free', {
    maxUsers: 2,
    maxContacts: 100,
    maxDeals: 50,
    maxStorageMb: 500,
    features: [Feature.BASIC_CRM]
  });

  static readonly STARTER = new SubscriptionTier('starter', {
    maxUsers: 5,
    maxContacts: 5000,
    maxDeals: 1000,
    maxStorageMb: 5120,
    features: [Feature.BASIC_CRM, Feature.ANALYTICS, Feature.API_ACCESS]
  });

  static readonly PRO = new SubscriptionTier('pro', {
    maxUsers: 20,
    maxContacts: 50000,
    maxDeals: 10000,
    maxStorageMb: 51200,
    features: [Feature.BASIC_CRM, Feature.ANALYTICS, Feature.API_ACCESS, Feature.CUSTOM_FIELDS, Feature.AUTOMATIONS]
  });

  private constructor(
    public readonly name: string,
    private readonly limits: TierLimits
  ) {}

  static fromName(name: string): SubscriptionTier {
    switch (name) {
      case 'free': return SubscriptionTier.FREE;
      case 'starter': return SubscriptionTier.STARTER;
      case 'pro': return SubscriptionTier.PRO;
      default: return SubscriptionTier.FREE; // Fallback
    }
  }

  hasFeature(feature: Feature): boolean {
    return this.limits.features.includes(feature);
  }

  canAddUser(currentUsers: number): boolean {
    return currentUsers < this.limits.maxUsers;
  }

  isLowerThan(other: SubscriptionTier): boolean {
    const order = ['free', 'starter', 'pro', 'enterprise'];
    return order.indexOf(this.name) < order.indexOf(other.name);
  }
}
