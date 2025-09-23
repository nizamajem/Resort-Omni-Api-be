import { Repository } from 'typeorm';
import { OmniAlias } from '../entities/omni-alias.entity';
import { OmniLog } from '../entities/omni-log.entity';
export declare class OmniService {
    private readonly aliasRepo;
    private readonly logRepo;
    constructor(aliasRepo: Repository<OmniAlias>, logRepo: Repository<OmniLog>);
    listAliases(): Promise<OmniAlias[]>;
    upsertAlias(input: {
        ebikeNumber: string;
        imei: string;
        displayName?: string | null;
        photoUrl?: string | null;
        metadata?: Record<string, any> | null;
    }): Promise<OmniAlias>;
    updateAliasMeta(imei: string, data: {
        displayName?: string;
        photoUrl?: string;
        metadata?: Record<string, any>;
    }): Promise<OmniAlias>;
    deleteAlias(ebikeNumber: string): Promise<boolean>;
    resolveByEbike(ebikeNumber: string): Promise<OmniAlias | null>;
    resolveByImei(imei: string): Promise<OmniAlias | null>;
    logAction(entry: Partial<OmniLog>): Promise<OmniLog>;
    listLogs(limit?: number): Promise<OmniLog[]>;
    clearLogs(): Promise<void>;
}
