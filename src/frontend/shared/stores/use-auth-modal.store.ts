import { create } from 'zustand';

/**
 * Тип для стану модального вікна автентифікації.
 * @property {boolean} isOpen - Чи відкрито модальне вікно.
 * @property {() => void} open - Функція для відкриття модального вікна.
 * @property {() => void} close - Функція для закриття модального вікна.
 */
type AuthModalStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

/**
 * Zustand стор для керування станом модального вікна автентифікації.
 * Дозволяє відкривати та закривати модалку з будь-якої частини додатку.
 *
 * @example
 * // В компоненті, щоб відкрити вікно:
 * import { useAuthModal } from '@/shared/stores/use-auth-modal.store';
 * const { open } = useAuthModal();
 * open();
 *
 * @example
 * // В модальному вікні, щоб керувати станом:
 * const { isOpen, close } = useAuthModal();
 * // ... <Dialog open={isOpen} onOpenChange={close}> ...
 */
export const useAuthModal = create<AuthModalStore>(set => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
