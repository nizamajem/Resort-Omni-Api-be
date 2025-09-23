import { OmniService } from './omni.service';
export declare class BikesController {
    private readonly omni;
    constructor(omni: OmniService);
    list(): Promise<{
        ok: boolean;
        data: any[];
    }>;
    sync(): Promise<{
        updated: number;
        total: number;
        ok: boolean;
    }>;
    meta(body: any): Promise<{
        ok: boolean;
        data: import("../entities/bike.entity").Bike;
    }>;
}
