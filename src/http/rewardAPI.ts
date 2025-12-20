import { $authHost } from "./index";

export const createReward = async (rewardData: {
    name: string;
    price: number;
    tonPrice?: number;
    description?: string;
    onlyCase?: boolean;
    isActive?: boolean;
}, imageFile?: File) => {
    const formData = new FormData();
    formData.append('name', rewardData.name);
    formData.append('price', rewardData.price.toString());
    if (rewardData.tonPrice) {
        formData.append('tonPrice', rewardData.tonPrice.toString());
    }
    if (rewardData.description) {
        formData.append('description', rewardData.description);
    }
    if (rewardData.onlyCase !== undefined) {
        formData.append('onlyCase', rewardData.onlyCase.toString());
    }
    if (rewardData.isActive !== undefined) {
        formData.append('isActive', rewardData.isActive.toString());
    }
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const { data } = await $authHost.post('api/reward/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const getAllRewards = async () => {
    const { data } = await $authHost.get('api/reward/all');
    return data;
};

export const updateReward = async (id: number, rewardData: {
    name?: string;
    price?: number;
    tonPrice?: number;
    description?: string;
    isActive?: boolean;
    onlyCase?: boolean;
}, imageFile?: File) => {
    const formData = new FormData();
    if (rewardData.name !== undefined) {
        formData.append('name', rewardData.name);
    }
    if (rewardData.price !== undefined) {
        formData.append('price', rewardData.price.toString());
    }
    if (rewardData.tonPrice !== undefined) {
        formData.append('tonPrice', rewardData.tonPrice.toString());
    }
    if (rewardData.description !== undefined) {
        formData.append('description', rewardData.description);
    }
    if (rewardData.isActive !== undefined) {
        formData.append('isActive', rewardData.isActive.toString());
    }
    if (rewardData.onlyCase !== undefined) {
        formData.append('onlyCase', rewardData.onlyCase.toString());
    }
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const { data } = await $authHost.put(`api/reward/update/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const deleteReward = async (id: number) => {
    const { data } = await $authHost.delete(`api/reward/delete/${id}`);
    return data;
};

export const getAvailableRewards = async () => {
    const { data } = await $authHost.get('api/reward/available');
    return data;
};

export const purchaseReward = async (id: number) => {
    const { data } = await $authHost.post(`api/reward/purchase/${id}`);
    return data;
};

export const getMyPurchases = async () => {
    const { data } = await $authHost.get('api/reward/my-purchases');
    return data;
};

export const getRewardStats = async () => {
    const { data } = await $authHost.get('api/reward/stats');
    return data;
};
