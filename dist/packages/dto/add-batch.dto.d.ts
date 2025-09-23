declare class BatchItemDto {
    email: string;
    password: string;
}
export declare class AddBatchDto {
    pkg: string;
    items: BatchItemDto[];
}
export {};
