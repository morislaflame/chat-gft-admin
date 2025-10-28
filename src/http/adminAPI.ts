import { $authHost } from "./index";

export const getUsers = async () => {
    const { data } = await $authHost.get('api/admin/users');
    return data;
};

export const getUserDetails = async (userId: string) => {
    const { data } = await $authHost.get(`api/admin/users/${userId}`);
    return data;
};

export const getTotalPurchases = async () => {
    const { data } = await $authHost.get('api/admin/purchases');
    return data;
};

export const getAnalytics = async () => {
    const { data } = await $authHost.get('api/admin/analytics');
    return data;
};

export const getDashboardData = async () => {
    const { data } = await $authHost.get('api/admin/dashboard');
    return data;
};