"use client";

import { useEffect, useState } from "react";

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

  return { tg, isTelegram };
}
