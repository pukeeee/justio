import { User } from '@/backend/domain/entities/user.entity';
import { UserStatus } from '@/backend/domain/value-objects/user-status.enum';

type DbUser = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: string; // Drizzle enum returns string
  createdAt: Date;
  updatedAt: Date;
};

export class UserMapper {
  static toDomain(raw: DbUser): User {
    return User.create({
      id: raw.id,
      email: raw.email,
      fullName: raw.fullName,
      avatarUrl: raw.avatarUrl,
      status: raw.status as UserStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
