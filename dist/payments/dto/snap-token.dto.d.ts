declare class CustomerDto {
    firstName?: string;
    email?: string;
}
export declare class SnapTokenDto {
    orderId: string;
    grossAmount: number;
    itemName?: string;
    customer?: CustomerDto;
    mode?: 'sandbox' | 'production';
}
export {};
