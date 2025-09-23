export declare class ResortAccount {
    id: string;
    resortName: string;
    email: string;
    password: string;
    status: 'active' | 'disabled';
    createdAt: Date;
    updatedAt?: Date;
}
