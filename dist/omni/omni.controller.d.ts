import { OmniService } from './omni.service';
export declare class OmniController {
    private readonly service;
    constructor(service: OmniService);
    acceptRoot(body: any): Promise<{
        ok: boolean;
        data: any;
    }>;
    callback(body: any): Promise<string>;
    ping(): Promise<{
        ok: boolean;
        data: any;
    }>;
    listAliases(): Promise<{
        ok: boolean;
        data: any;
    }>;
    saveAlias(body: any): Promise<any>;
    deleteAlias(ebike?: string): Promise<any>;
    saveMeta(body: any): Promise<any>;
    listBikes(): Promise<{
        ok: boolean;
        data: {
            id: string;
            imei: string;
            ebikeNumber: string;
            deviceNo: string;
            name: string;
            photoUrl: string;
            metadata: Record<string, any>;
            isOnline: any;
            equipmentStatus: string;
        }[];
    }>;
    syncBikes(): Promise<{
        ok: boolean;
        data: any;
    }>;
    resolve(ebike?: string): Promise<any>;
    unlock(body: any): Promise<any>;
    command(body: any): Promise<any>;
    logs(limit?: string): Promise<{
        ok: boolean;
        logs: {
            ts: number;
            path: string;
            method: string;
            ip: any;
            src: "controller";
            query: {};
            headers: {};
            body: {
                action: string;
                status: string;
                ok: boolean;
                note: string;
                request: Record<string, any>;
                response: Record<string, any>;
            };
            omni: Record<string, any>;
        }[];
        raw: import("../entities/omni-log.entity").OmniLog[];
    }>;
    clearLogs(): Promise<{
        ok: boolean;
    }>;
    proxyFallback(body: any): Promise<any>;
}
