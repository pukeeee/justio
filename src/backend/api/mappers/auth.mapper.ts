import type { AuthenticatedUser } from "@/backend/application/dtos/auth/auth-result.dto";
import type { UserResponse } from "../contracts/auth.contracts";

/**
 * Mapper для даних користувача та авторизації
 */
export class AuthMapper {
  /**
   * Перетворює об'єкт AuthenticatedUser у UserResponse для UI
   */
  toUserResponse(user: AuthenticatedUser): UserResponse {
    const fullName = user.fullName || user.email.split("@")[0] || "Користувач";
    
    return {
      id: user.id,
      name: fullName,
      email: user.email,
      avatar: user.avatarUrl || "",
      initials: this.generateInitials(user.email, user.fullName || undefined),
    };
  }

  /**
   * Генерує ініціали з email або імені
   */
  private generateInitials(email: string, fullName?: string): string {
    if (fullName) {
      const parts = fullName.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }

    // Якщо немає імені - беремо з email
    const emailPart = email.split("@")[0];
    return emailPart.substring(0, 2).toUpperCase();
  }
}
