import { useCallback } from 'react';

export const useTelegramApp = () => {
  const tg = window.Telegram?.WebApp;

  const disableVerticalSwipes = useCallback(() => {
    if (tg && tg.disableVerticalSwipes) {
      tg.disableVerticalSwipes();
    }
  }, [tg]);

  const enableVerticalSwipes = useCallback(() => {
    if (tg && tg.enableVerticalSwipes) {
      tg.enableVerticalSwipes();
    }
  }, [tg]);

  const lockOrientation = useCallback(() => {
    if (tg && tg.lockOrientation) {
      tg.lockOrientation();
    }
  }, [tg]);

  const unlockOrientation = useCallback(() => {
    if (tg && tg.unlockOrientation) {
      tg.unlockOrientation();
    }
  }, [tg]);

  const expand = useCallback(() => {
    if (tg && tg.expand) {
      tg.expand();
    }
  }, [tg]);

  const close = useCallback(() => {
    if (tg && tg.close) {
      tg.close();
    }
  }, [tg]);

  const ready = useCallback(() => {
    if (tg && tg.ready) {
      tg.ready();
    }
  }, [tg]);

  const setHeaderColor = useCallback((color: string) => {
    if (tg && tg.setHeaderColor) {
      tg.setHeaderColor(color);
    }
  }, [tg]);

  const setBackgroundColor = useCallback((color: string) => {
    if (tg && tg.setBackgroundColor) {
      tg.setBackgroundColor(color);
    }
  }, [tg]);

  const getStartParam = useCallback(() => {
    if (tg?.initDataUnsafe?.start_param) {
      return tg.initDataUnsafe.start_param;
    }
    return null;
  }, [tg]);

  const shareMessage = useCallback((msgId: string, callback?: (success: boolean) => void) => {
    if (tg && tg.shareMessage) {
      tg.shareMessage(msgId, callback);
    } else {
      console.warn('shareMessage is not available in this Telegram WebApp version');
      if (callback) {
        callback(false);
      }
    }
  }, [tg]);

  const shareUrl = useCallback((url: string, text?: string) => {
    if (tg) {
      const shareLink = `https://t.me/share/url?` + new URLSearchParams({ 
        url, 
        text: text || '' 
      })
        .toString()
        // By default, URL search params encode spaces with "+".
        // We are replacing them with "%20", because plus symbols are working incorrectly
        // in Telegram.
        .replace(/\+/g, '%20');
      
      tg.openTelegramLink(shareLink);
    } else {
      console.warn('Telegram WebApp is not available');
    }
  }, [tg]);

  const openTelegramLink = useCallback((link: string) => {
    if (tg && tg.openTelegramLink) {
      tg.openTelegramLink(link);
    }
  }, [tg]);

  return {
    disableVerticalSwipes,
    enableVerticalSwipes,
    lockOrientation,
    unlockOrientation,
    expand,
    close,
    ready,
    setHeaderColor,
    setBackgroundColor,
    getStartParam,
    shareMessage,
    shareUrl,
    openTelegramLink,
    isAvailable: !!tg
  };
};