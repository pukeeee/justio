import { BaseController } from "./base.controller";
import { AuthMapper } from "../mappers/auth.mapper";
import type { ApiResponse } from "../contracts/base.contracts";
import type {
  UserResponse,
  AuthStatusResponse,
} from "../contracts/auth.contracts";

/**
 * Контролер для керування автентифікацією та даними користувача
 */
export class AuthController extends BaseController {
  private mapper: AuthMapper;

  constructor() {
    super();
    this.mapper = new AuthMapper();
  }

  /**
   * Отримує дані поточного користувача
   * Використовує action, бо авторизація обов'язкова
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return this.action(this.getCurrentUser, {}, null, async (_, user) => {
      return this.mapper.toUserResponse(user);
    });
  }

  /**
   * Отримує статус авторизації
   * Використовує execute, бо авторизація ОПЦІОНАЛЬНА
   */
  async getStatus(): Promise<ApiResponse<AuthStatusResponse>> {
    return this.execute(async () => {
      const user = await this.authService.getCurrentUser();

      return {
        isAuthenticated: !!user,
        user: user ? this.mapper.toUserResponse(user) : null,
      };
    });
  }

  /**
   * Ініціює OAuth вхід
   */
  async signInWithOAuth(
    provider: "google",
    callbackUrl: string,
  ): Promise<string> {
    return this.authService.signInWithOAuth(provider, callbackUrl);
  }

  /**
   * Вихід з системи
   */
  async signOut(): Promise<void> {
    return this.authService.signOut();
  }

  /**
   * Отримує роль користувача у воркспейсі за ID
   */
  async getUserRole(workspaceId: string): Promise<ApiResponse<string | null>> {
    return this.action(
      this.getUserRole,
      { workspaceId },
      null,
      async (data: { workspaceId: string }, user) => {
        const role = await this.authorizationService.getUserRole(
          user.id,
          data.workspaceId,
        );
        return role ? role.name : null;
      },
    );
  }

  /**
   * Отримує роль користувача у воркспейсі за слагом
   */
  async getUserRoleBySlug(slug: string): Promise<ApiResponse<string | null>> {
    // Тут ми передаємо slug, а action не знає, як перевірити права за слагом автоматично (тільки за ID)
    // Але нам і не потрібна перевірка прав тут, бо ми просто запитуємо "яка у мене роль?"
    return this.action(
      this.getUserRoleBySlug,
      { slug },
      null,
      async (data: { slug: string }, user) => {
        const role = await this.authorizationService.getUserRoleBySlug(
          user.id,
          data.slug,
        );
        return role ? role.name : null;
      },
    );
  }
}

export const authController = new AuthController();
