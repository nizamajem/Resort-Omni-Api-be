import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';
type PackageKey = '1h' | '3h' | '12h' | '1d';
type PaymentKey = 'cash' | 'midtransSandbox' | 'midtransProduction';
type PackageRole = 'resort' | 'partnership';
export type CustomPackageConfig = {
    id: string;
    name: string;
    blockMinutes: number;
    pricePerBlock: number;
    enabled?: boolean;
    description?: string;
    roles?: PackageRole[];
};
export type FeatureConfig = {
    packages: Record<PackageKey, boolean>;
    packageRoles: Record<PackageKey, PackageRole[]>;
    payments: Record<PaymentKey, boolean>;
    packagePrices: Record<PackageKey, number>;
    rentalExtras: {
        extraGraceMinutes: number;
        extraHourlyRate: number;
        extraBlockMinutes: number;
    };
    customPackages: CustomPackageConfig[];
};
export declare class SettingsService {
    private readonly settings;
    constructor(settings: Repository<Setting>);
    private loadFeatureRow;
    getFeatures(): Promise<FeatureConfig>;
    updateFeatures(input: Partial<FeatureConfig>): Promise<FeatureConfig>;
    getJson<T = any>(key: string, fallback?: T | null): Promise<T | null>;
    setJson<T = any>(key: string, value: T): Promise<T>;
}
