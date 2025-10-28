import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from '@/router/routes';
import { AUTH_ROUTE, DASHBOARD_ROUTE } from '@/utils/consts';
import { Context, type IStoreContext } from '@/store/StoreProvider';

const AppRouter = () => {
    const { user } = useContext(Context) as IStoreContext;

    return (
        <Routes>
            {/* Публичные маршруты доступны всем */}
            {publicRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}

            {/* Приватные маршруты только для авторизованных */}
            {user.isAuth && privateRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}

            {/* Перенаправления */}
            <Route 
                path="*" 
                element={
                    user.isAuth ? 
                        <Navigate to={DASHBOARD_ROUTE} replace /> : 
                        <Navigate to={AUTH_ROUTE} replace />
                } 
            />
        </Routes>
    );
};

export default AppRouter;
