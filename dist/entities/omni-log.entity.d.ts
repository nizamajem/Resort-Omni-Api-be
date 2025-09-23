export declare class OmniLog {
    id: string;
    ebikeNumber?: string | null;
    imei?: string | null;
    action: string;
    status?: string | null;
    ok: boolean;
    note?: string | null;
    requestPayload?: Record<string, any> | null;
    responsePayload?: Record<string, any> | null;
    createdAt: Date;
}
