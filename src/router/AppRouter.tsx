import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from '@/router/routes';
import { MAIN_ROUTE } from '@/utils/consts';
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

            <Route path="*" element={<Navigate to={MAIN_ROUTE} />} />
        </Routes>
    );
};

export default AppRouter;
