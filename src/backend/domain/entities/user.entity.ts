import { Email } from '../value-objects/email.vo';
import { UserStatus } from '../value-objects/user-status.enum';

/**
 * Сутність Користувача.
 * Представляє зареєстрованого користувача системи.
 */
export class User {
  private constructor(
    public readonly id: string,
    private _email: Email,
    private _fullName: string | null,
    private _avatarUrl: string | null,
    private _status: UserStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(props: {
    id: string; // ID зазвичай приходить з Auth провайдера (Supabase)
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    status?: UserStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    return new User(
      props.id,
      Email.create(props.email),
      props.fullName ?? null,
      props.avatarUrl ?? null,
      props.status ?? UserStatus.ACTIVE,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  get email(): string {
    return this._email.value;
  }

  get fullName(): string | null {
    return this._fullName;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  suspend(): void {
    if (this._status === UserStatus.ACTIVE) {
      this._status = UserStatus.SUSPENDED;
      this.touch();
    }
  }

  activate(): void {
    if (this._status === UserStatus.SUSPENDED) {
      this._status = UserStatus.ACTIVE;
      this.touch();
    }
  }

  updateProfile(fullName: string | null, avatarUrl: string | null): void {
    this._fullName = fullName;
    this._avatarUrl = avatarUrl;
    this.touch();
  }

  private touch(): void {
    // У реальній реалізації тут можна оновлювати updatedAt, 
    // але оскільки це entity, краще це робити явно або через події
    // this.updatedAt = new Date(); // (якщо поле не readonly)
  }
}
