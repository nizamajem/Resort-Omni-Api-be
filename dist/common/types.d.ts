export type ResortAccount = {
    id: string;
    resortName: string;
    email: string;
    password: string;
    status: 'active' | 'disabled';
    createdAt: string;
    updatedAt?: string;
};
export type PackageAccount = {
    id: string;
    pkg: '1h' | '3h' | '1d' | string;
    email: string;
    password: string;
    status: 'active' | 'sold';
    createdAt: string;
    updatedAt?: string;
};
export type HistoryItem = {
    id: string;
    resortName: string;
    userEmail: string;
    userPassword: string;
    packageName: string;
    price: number;
    duration: string;
    purchasedAt: string;
    status: 'success' | 'failed' | 'canceled' | 'pending';
    paymentMethod: 'cash' | 'online';
    orderId?: string;
};
export type DBShape = {
    resorts: ResortAccount[];
    packageAccounts: PackageAccount[];
    history: HistoryItem[];
};
