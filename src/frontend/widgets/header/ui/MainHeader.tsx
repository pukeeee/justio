import { getFormattedUserData } from "@/frontend/shared/lib/auth/get-user-data";
import { MainHeaderClient } from "./MainHeaderClient";

/**
 * Server Component - получает данные о пользователе на сервере
 * Это решает проблемы с гидратацией и мигающим UI
 */
export async function MainHeader() {
  const user = await getFormattedUserData();

  return <MainHeaderClient user={user} />;
}
