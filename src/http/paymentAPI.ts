import { $authHost } from "./index";

export const generateInvoice = async (productId: number) => {
    const { data } = await $authHost.post('api/payment/generate-invoice', { productId });
    return data;
};

export const getAllOrders = async () => {
    const { data } = await $authHost.get('api/payment/orders');
    return data;
};
