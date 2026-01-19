"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useAuthModal } from "@/shared/stores/use-auth-modal.store";
import { LoginForm } from "@/features/auth/ui/LoginForm";

/**
 * Глобальне модальне вікно для автентифікації.
 * Керується через `useAuthModal` стор.
 *
 * Цей компонент є "прозорою" обгорткою, оскільки
 * LoginForm вже містить в собі компонент Card зі стилями.
 * Ми просто надаємо функціонал модального вікна.
 */
export function AuthModal() {
  const { isOpen, close } = useAuthModal();

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="p-0 bg-transparent border-none max-w-[calc(100%-1rem)] sm:max-w-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>Вхід або Реєстрація</DialogTitle>
          <DialogDescription>
            Використовуйте Google або інший спосіб для входу у ваш акаунт.
          </DialogDescription>
        </DialogHeader>
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
