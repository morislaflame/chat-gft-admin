import { lazy, Suspense, useContext, useEffect, useState } from 'react'
import { BrowserRouter } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import { useTelegramApp } from '@/utils/useTelegramApp';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/LoadingIndicator';

const AppRouter = lazy(() => import("@/router/AppRouter"));

const App = observer(() => {
  const { user } = useContext(Context) as IStoreContext;
  const [loading, setLoading] = useState(true);
  const {
    disableVerticalSwipes,
    lockOrientation,
    ready,
    isAvailable,
    setHeaderColor,
    setBackgroundColor
  } = useTelegramApp();


  useEffect(() => {
    if (isAvailable) {
      disableVerticalSwipes();
      setHeaderColor('#191919');
      setBackgroundColor('#191919');
      lockOrientation();

      ready();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable, disableVerticalSwipes, lockOrientation, ready]);

  const tg = window?.Telegram?.WebApp;

  useEffect(() => {
    const authenticate = async () => {
      const initData = tg?.initData;
      console.log("Init Data:", initData); // Для отладки

      if (initData) {
        try {
          // Выполняем аутентификацию через Telegram
          await user.telegramLogin(initData);
        } catch (error) {
          console.error("Telegram authentication error:", error);
        }
      } else {
        try {
          // Выполняем проверку состояния аутентификации
          await user.checkAuth();
        } catch (error) {
          console.error("Check authentication error:", error);
        }
      }
      setLoading(false);
    };

    authenticate();
  }, [user]);

  if (loading) {
    return <LoadingIndicator />;
  }


  return (
      <BrowserRouter>
        <div>
            <Suspense fallback={<LoadingIndicator />}>
              <AppRouter />
            </Suspense>
        </div>
      </BrowserRouter>
  )
});

export default App;
