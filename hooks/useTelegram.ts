"use client";

import { useEffect, useState, useCallback } from "react";

export default function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const telegram = (window as any)?.Telegram?.WebApp;
    if (telegram) {
      setTg(telegram);
      setIsTelegram(true);
      telegram.ready();
      telegram.expand();
    }
  }, []);

  const setPageTitle = useCallback((title: string) => {
    if (tg) {
      // Telegram doesn't have a direct setTitle method, but we can use the headerColor
      // The title is controlled by the bot configuration
      // We'll just track that we're in Telegram mode
      document.title = title; // Set browser title as fallback
    }
  }, [tg]);

  const showBackButton = useCallback((onClick: () => void) => {
    if (tg?.BackButton) {
      tg.BackButton.onClick(onClick);
      tg.BackButton.show();
    }
  }, [tg]);

  const hideBackButton = useCallback(() => {
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
  }, [tg]);

  return { tg, isTelegram, setPageTitle, showBackButton, hideBackButton };
}
