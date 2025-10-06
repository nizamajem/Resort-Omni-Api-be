import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';
type PackageKey = '1h' | '3h' | '12h' | '1d';
type PaymentKey = 'cash' | 'midtransSandbox' | 'midtransProduction';
export type FeatureConfig = {
    packages: Record<PackageKey, boolean>;
    payments: Record<PaymentKey, boolean>;
};
export declare class SettingsService {
    private readonly settings;
    constructor(settings: Repository<Setting>);
    private loadFeatureRow;
    getFeatures(): Promise<FeatureConfig>;
    updateFeatures(input: Partial<FeatureConfig>): Promise<FeatureConfig>;
}
export {};
