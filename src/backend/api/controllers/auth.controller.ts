import { BaseController } from "./base.controller";
import { AuthMapper } from "../mappers/auth.mapper";
import type { ApiResponse } from "../contracts/base.contracts";
import type { UserResponse, AuthStatusResponse } from "../contracts/auth.contracts";
import { headers } from "next/headers";

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
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return this.execute(async () => {
      const user = await this.getCurrentUserOrThrow();
      return this.mapper.toUserResponse(user);
    });
  }

  /**
   * Отримує статус авторизації
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
  async signInWithOAuth(provider: 'google', callbackUrl: string): Promise<string> {
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
    return this.execute(async () => {
      const user = await this.getCurrentUserOrThrow();
      const role = await this.authorizationService.getUserRole(user.id, workspaceId);
      return role ? role.name : null;
    });
  }

  /**
   * Отримує роль користувача у воркспейсі за слагом
   */
  async getUserRoleBySlug(slug: string): Promise<ApiResponse<string | null>> {
    return this.execute(async () => {
      const user = await this.getCurrentUserOrThrow();
      const role = await this.authorizationService.getUserRoleBySlug(user.id, slug);
      return role ? role.name : null;
    });
  }
}

/**
 * Singleton instance
 */
export const authController = new AuthController();
