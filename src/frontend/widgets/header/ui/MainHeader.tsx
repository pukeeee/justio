import { MainHeaderClient } from "./MainHeaderClient";

/**
 * Server Component - обгортка для хедера.
 * Дані користувача завантажуються на клієнті для підтримки SSG публічних сторінок.
 */
export function MainHeader() {
  return <MainHeaderClient />;
}
