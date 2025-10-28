// src/routes.ts (если у вас массив роутов)
import type { ComponentType } from 'react';
import MainPage from '@/pages/MainPage';
import { MAIN_ROUTE } from '@/utils/consts';

interface Route {
  path: string;
  Component: ComponentType;
}

export const publicRoutes: Route[] = [
  { path: MAIN_ROUTE, Component: MainPage },
];

export const privateRoutes: Route[] = [
  // Для авторизованных пользователей - позже добавим личный кабинет и т.д.
];
