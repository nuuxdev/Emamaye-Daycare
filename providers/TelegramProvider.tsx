"use client";

import { useEffect } from "react";

export default function TelegramProvider() {
  useEffect(() => {
    // Dynamically load Telegram SDK only in browser
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        console.log("✅ Telegram WebApp SDK loaded");
        console.log(tg.version, navigator.userAgent);
        tg.ready();
        tg.expand();

        // Set header color to match app theme
        if (tg.setHeaderColor) {
          tg.setHeaderColor("#e0e5ec"); // Match --background color
        }
      }
    };

    script.onerror = () => {
      console.error("❌ Failed to load Telegram WebApp SDK");
    };

    return () => {
      // Cleanup script if component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component just runs the setup
}
