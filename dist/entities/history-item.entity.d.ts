export declare class HistoryItem {
    id: string;
    resortName: string;
    userEmail: string;
    userPassword: string;
    packageName: string;
    price: number;
    duration: string;
    purchasedAt: Date;
    status: 'success' | 'failed' | 'canceled' | 'pending';
    paymentMethod: 'cash' | 'online';
    orderId?: string;
}
