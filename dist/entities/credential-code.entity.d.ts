export declare class CredentialCode {
    id: string;
    code: string;
    userId: string;
    resortName: string;
    rentalId?: string | null;
    status: 'active' | 'expired';
    createdAt: Date;
    updatedAt?: Date;
}
