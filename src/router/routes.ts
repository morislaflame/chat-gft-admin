// src/routes.ts (если у вас массив роутов)
import type { ComponentType } from 'react';
import MainPage from '@/pages/MainPage';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import MessagesPage from '@/pages/MessagesPage';
import QuestsPage from '@/pages/QuestsPage';
import PaymentsPage from '@/pages/PaymentsPage';
import ProductsPage from '@/pages/ProductsPage';
import RewardsPage from '@/pages/RewardsPage';
import AgentsPage from '@/pages/AgentsPage';
import DailyRewardsPage from '@/pages/DailyRewardsPage';
import WithdrawalsPage from '@/pages/WithdrawalsPage';
import UserDetailsPage from '@/pages/UserDetailsPage';
import {
  MAIN_ROUTE,
  AUTH_ROUTE,
  DASHBOARD_ROUTE,
  USERS_ROUTE,
  MESSAGES_ROUTE,
  QUESTS_ROUTE,
  PAYMENTS_ROUTE,
  PRODUCTS_ROUTE,
  REWARDS_ROUTE,
  AGENTS_ROUTE,
  DAILY_REWARDS_ROUTE,
  WITHDRAWALS_ROUTE,
  USER_DETAILS_ROUTE
} from '@/utils/consts';

interface Route {
  path: string;
  Component: ComponentType;
}

export const publicRoutes: Route[] = [
  { path: MAIN_ROUTE, Component: MainPage },
  { path: AUTH_ROUTE, Component: AuthPage },
];

export const privateRoutes: Route[] = [
  { path: DASHBOARD_ROUTE, Component: DashboardPage },
  { path: USERS_ROUTE, Component: UsersPage },
  { path: USER_DETAILS_ROUTE, Component: UserDetailsPage },
  { path: MESSAGES_ROUTE, Component: MessagesPage },
  { path: QUESTS_ROUTE, Component: QuestsPage },
  { path: PAYMENTS_ROUTE, Component: PaymentsPage },
  { path: PRODUCTS_ROUTE, Component: ProductsPage },
  { path: REWARDS_ROUTE, Component: RewardsPage },
  { path: AGENTS_ROUTE, Component: AgentsPage },
  { path: DAILY_REWARDS_ROUTE, Component: DailyRewardsPage },
  { path: WITHDRAWALS_ROUTE, Component: WithdrawalsPage },
];
