/**
 * @file Конфігурація Vitest для інтеграційних тестів.
 * @description Цей файл налаштовує середовище для запуску інтеграційних тестів.
 * Він завантажує змінні середовища, визначає шляхи, таймаути та файли налаштувань,
 * специфічні для тестів, що взаємодіють з базою даних.
 */

import { defineConfig } from "vitest/config";
import path from "path";
import { config } from "dotenv";

// Явно завантажуємо змінні середовища з кореневого .env файлу.
// Це необхідно для отримання доступу до ключів Supabase.
config({ path: path.resolve(__dirname, "../../../.env") });

export default defineConfig({
  test: {
    // Вказуємо корінь проекту.
    root: path.resolve(__dirname, "../../.."),
    // Назва групи тестів, яка відображається у звітах.
    name: "integration",
    // Дозволяє використовувати глобальні змінні Vitest (describe, it, expect) без імпорту.
    globals: true,
    // Середовище виконання тестів. 'node' є стандартним для бекенд-тестів.
    environment: "node",
    // Паттерн для пошуку файлів з інтеграційними тестами.
    include: ["tests/integration/**/*.test.ts"],
    // Виключаємо юніт-тести та модулі node_modules.
    exclude: ["tests/unit/**", "node_modules/**"],
    // Таймаут для одного тесту. Збільшено до 30с через можливі затримки в операціях з БД.
    testTimeout: 30000,
    // Таймаут для хуків (beforeEach, afterEach). Збільшено до 60с для налаштування та очищення БД.
    hookTimeout: 60000,
    // Файл, який виконується перед запуском тестів для налаштування середовища.
    setupFiles: ["./tests/lib/setup/integration-setup.ts"],
    // Стратегія запуску тестів. 'forks' створює окремий процес для кожного файлу,
    // що є критично важливим для ізоляції тестів, які працюють з однією БД.
    pool: "forks",
    // Запускати тести послідовно в одному процесі, щоб уникнути конфліктів з БД.
    maxWorkers: 1,
  },
  // Глобальна заміна змінних середовища для інтеграційних тестів.
  // Це гарантує, що код програми, який використовує, наприклад,
  // `process.env.NEXT_PUBLIC_SUPABASE_URL`, під час тестів отримає
  // значення з `process.env.NEXT_PUBLIC_SUPABASE_TEST_URL`.
  define: {
    "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_TEST_URL),
    "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_TEST_ANON_KEY),
    "process.env.SUPABASE_SERVICE_ROLE_KEY": JSON.stringify(process.env.SUPABASE_TEST_SERVICE_KEY),
  },
  resolve: {
    // Налаштування аліасів для зручних імпортів у тестах.
    alias: {
      "@": path.resolve(__dirname, "../../../src"),
      "@tests": path.resolve(__dirname, "../../../tests"),
    },
  },
});
