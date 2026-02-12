import { BaseController } from "./base.controller";
import { AuthMapper } from "../mappers/auth.mapper";
import type { ApiResponse } from "../contracts/base.contracts";
import type { UserResponse, AuthStatusResponse } from "../contracts/auth.contracts";

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
}

/**
 * Singleton instance
 */
export const authController = new AuthController();
