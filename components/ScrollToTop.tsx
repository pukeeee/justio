"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

/**
 * Компонент для відображення іконки стрілки вгору.
 * Використовує SVG для гнучкості та якості.
 */
const ArrowUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
    />
  </svg>
);

/**
 * Основний компонент кнопки "Нагору".
 * Кнопка з'являється, коли користувач прокручує сторінку вниз,
 * і дозволяє плавно повернутися на початок.
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Функція для плавної прокрутки до верху сторінки.
   * Використовує `window.scrollTo` з опцією `behavior: 'smooth'`.
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    /**
     * Обробник події прокрутки.
     * Показує або ховає кнопку в залежності від позиції скролу.
     * @returns {void}
     */
    const toggleVisibility = () => {
      // Показуємо кнопку, якщо прокрутка більше 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Додаємо слухача події прокрутки
    window.addEventListener("scroll", toggleVisibility);

    // Важливо: прибираємо слухача, коли компонент демонтується,
    // щоб уникнути витоків пам'яті.
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isVisible && (
        <Button
          onClick={scrollToTop}
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg"
          aria-label="Прокрутити до верху"
        >
          <ArrowUpIcon />
        </Button>
      )}
    </div>
  );
}
