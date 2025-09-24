export declare class Rental {
    id: string;
    resortName: string;
    guestName: string;
    roomNumber: string;
    pkg: '1h' | '3h' | '1d';
    packageName: string;
    basePrice: number;
    baseMinutes: number;
    startedAt: number;
    endedAt?: number | null;
    status: 'active' | 'unpaid' | 'paid';
    amountDue?: number;
    paymentOrderId?: string;
    paymentType?: string;
    credentialEmail?: string;
    credentialPassword?: string;
    createdAt: Date;
    updatedAt: Date;
}
