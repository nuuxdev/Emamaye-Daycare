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
      console.log("✅ Telegram WebApp SDK loaded");
      console.log(window.Telegram?.WebApp?.version, navigator.userAgent);
      window.Telegram?.WebApp?.ready?.();
    };
  }, []);

  return null; // This component just runs the setup
}
