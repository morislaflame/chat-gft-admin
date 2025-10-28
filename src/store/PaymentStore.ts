import { makeAutoObservable, runInAction } from "mobx";
import { generateInvoice, getAllOrders } from "@/http/paymentAPI";

export interface Order {
    id: number;
    userId: number;
    productName: string;
    price: number;
    attemptsPurchased: number;
    status: 'initial' | 'completed' | 'paid' | 'refunded';
    telegramPaymentChargeId?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        username?: string;
        email?: string;
    };
}

export interface InvoiceResponse {
    invoiceLink: string;
}

export default class PaymentStore {
    _orders: Order[] = [];
    _loading = false;
    _error = '';

    constructor() {
        makeAutoObservable(this);
    }

    setOrders(orders: Order[]) {
        this._orders = orders;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    async generateInvoice(productId: number): Promise<InvoiceResponse> {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await generateInvoice(productId);
            return data;
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to generate invoice');
            });
            throw error;
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    async fetchAllOrders() {
        try {
            this.setLoading(true);
            this.setError('');
            const data = await getAllOrders();
            runInAction(() => {
                this.setOrders(data);
            });
        } catch (error: any) {
            runInAction(() => {
                this.setError(error.response?.data?.message || 'Failed to fetch orders');
            });
        } finally {
            runInAction(() => {
                this.setLoading(false);
            });
        }
    }

    get orders() {
        return this._orders;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }
}
