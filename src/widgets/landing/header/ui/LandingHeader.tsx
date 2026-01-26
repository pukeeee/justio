import { getFormattedUserData } from "@/shared/lib/auth/get-user-data";
import { LandingHeaderClient } from "./LandingHeaderClient";

/**
 * Server Component - получает данные о пользователе на сервере
 * Это решает проблемы с гидратацией и мигающим UI
 */
export async function LandingHeader() {
  const user = await getFormattedUserData();

  return <LandingHeaderClient user={user} />;
}
