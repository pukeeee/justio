import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * reactStrictMode: true
   *
   * Вмикає додаткові перевірки в React для виявлення потенційних проблем.
   * Важливо тримати увімкненим для підтримки високої якості коду.
   *
   * Якщо виникають проблеми з браком пам'яті в dev-режимі,
   * це, ймовірно, пов'язано з витоком пам'яті, а не зі strict mode.
   * Для стабільності розробки ми використовуємо прапор `--max-old-space-size`
   * в команді `npm run dev`, але проблему витоку варто дослідити окремо.
   */
  reactStrictMode: true,
  turbopack: {},
  webpack: (config, { dev }) => {
    // Налаштування для уникнення проблем з hot-reload у деяких середовищах (напр. Docker)
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.next/**"],
      };
      config.cache = false;
    }
    return config;
  },
  /**
   * Images конфігурація
   */
  images: {
    // Дозволені домени для зображень
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
    // Формати (за замовчуванням: ['image/webp'])
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
