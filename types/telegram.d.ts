// types/telegram.d.ts

export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: any;
        version?: string;
        colorScheme?: string;
        themeParams?: Record<string, string>;
        isExpanded?: boolean;
        viewportHeight?: number;
        viewportStableHeight?: number;
        MainButton?: {
          text?: string;
          color?: string;
          textColor?: string;
          isVisible?: boolean;
          isProgressVisible?: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setText: (text: string) => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        showAlert: (msg: string, cb?: () => void) => void;
        showConfirm: (msg: string, cb: (ok: boolean) => void) => void;
        sendData: (data: string) => void;
      };
    };
  }
}
