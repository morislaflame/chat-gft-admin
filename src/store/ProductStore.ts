import { makeAutoObservable, runInAction } from "mobx";
import { createProduct, getAllProducts, updateProduct, deleteProduct } from "@/http/productAPI";

export interface Product {
    id: number;
    name: string;
    energy: number;
    starsPrice: number;
    createdAt: string;
    updatedAt: string;
}

export default class ProductStore {
    _products: Product[] = [];
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
    }

    setProducts(products: Product[]) {
        this._products = products;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async createProduct(productData: {
        name: string;
        energy: number;
        starsPrice: number;
    }) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await createProduct(productData);
            runInAction(() => {
                this._products.unshift(data);
            });
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to create product');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async updateProduct(id: number, productData: {
        name?: string;
        energy?: number;
        starsPrice?: number;
    }) {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await updateProduct(id, productData);
            runInAction(() => {
                const index = this._products.findIndex(product => product.id === id);
                if (index !== -1) {
                    this._products[index] = data;
                }
            });
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to update product');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async deleteProduct(id: number) {
        try {
            this.setLoading(true);
            this.setError('');
            await deleteProduct(id);
            runInAction(() => {
                this._products = this._products.filter(product => product.id !== id);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to delete product');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchAllProducts() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getAllProducts();
            runInAction(() => {
                this.setProducts(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch products');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    get products() {
        return this._products;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
