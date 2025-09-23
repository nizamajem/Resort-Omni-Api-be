export declare class CompletePaymentDto {
    orderId: string;
    pkg: string;
    packageName: string;
    price: number;
    duration?: string;
    resortName?: string;
    guestName?: string;
    roomNumber?: string;
    mode?: 'sandbox' | 'production';
}
