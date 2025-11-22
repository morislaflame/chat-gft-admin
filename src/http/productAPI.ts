import { $authHost } from "./index";

export interface ReferralBonus {
    energy?: number;
    balance?: number;
}

export const createProduct = async (productData: {
    name: string;
    energy: number;
    starsPrice: number;
    referralBonus?: ReferralBonus | null;
}) => {
    const { data } = await $authHost.post('api/product/create', productData);
    return data;
};

export const getAllProducts = async () => {
    const { data } = await $authHost.get('api/product/all');
    return data;
};

export const updateProduct = async (id: number, productData: {
    name?: string;
    energy?: number;
    starsPrice?: number;
    referralBonus?: ReferralBonus | null;
}) => {
    const { data } = await $authHost.put(`api/product/update/${id}`, productData);
    return data;
};

export const deleteProduct = async (id: number) => {
    const { data } = await $authHost.delete(`api/product/delete/${id}`);
    return data;
};
