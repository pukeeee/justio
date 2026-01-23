import { getCachedUser } from "@/shared/lib/auth/get-user";
import { UserHeaderClient } from "./UserHeaderClient";

/**
 * Серверний компонент хедера кабінету користувача.
 * Отримує дані про користувача на сервері для уникнення проблем з гідратацією.
 */
export async function UserHeader() {
  const user = await getCachedUser();

  // Теоретично, layout вже робить редірект, але це додаткова перевірка.
  // Якщо користувача немає, можна повернути null або альтернативний layout.
  // Для простоти, ми передаємо user як є, а layout гарантує його наявність.

  return <UserHeaderClient user={user} />;
}
