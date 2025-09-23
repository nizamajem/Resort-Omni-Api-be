export declare class PackageAccount {
    id: string;
    pkg: string;
    email: string;
    password: string;
    status: 'active' | 'sold';
    createdAt: Date;
    updatedAt?: Date;
}
