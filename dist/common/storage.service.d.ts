import { DBShape } from './types';
export declare class StorageService {
    private ensure;
    load(): Promise<DBShape>;
    save(db: DBShape): Promise<void>;
}
export declare function uid(): string;
export declare function nowISO(): string;
