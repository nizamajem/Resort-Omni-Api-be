import { OmniService } from './omni.service';
import { Repository } from 'typeorm';
import { DeviceAlias } from '../entities/device-alias.entity';
export declare class DevicesController {
    private readonly omni;
    private readonly aliasRepo;
    constructor(omni: OmniService, aliasRepo: Repository<DeviceAlias>);
    devices(): Promise<any>;
    listAliases(): Promise<{
        ok: boolean;
        data: DeviceAlias[];
    }>;
    upsert(body: any): Promise<{
        ok: boolean;
        error: string;
        data?: undefined;
    } | {
        ok: boolean;
        data: DeviceAlias;
        error?: undefined;
    }>;
    remove(imei?: string, ebike?: string): Promise<{
        ok: boolean;
    } | {
        ok: boolean;
        error: string;
    }>;
    resolve(ebike?: string): Promise<any>;
    unlockByEbike(body: any): Promise<any>;
}
