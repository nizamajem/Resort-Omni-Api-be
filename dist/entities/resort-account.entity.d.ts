export declare class ResortAccount {
    id: string;
    resortName: string;
    email: string;
    password: string;
    role: 'resort' | 'partnership';
    status: 'active' | 'disabled';
    createdAt: Date;
    updatedAt?: Date;
}
