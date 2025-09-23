import { SettingsService } from './settings.service';
import { UpdateFeaturesDto } from './dto/update-features.dto';
export declare class SettingsController {
    private readonly settings;
    constructor(settings: SettingsService);
    getFeatures(): Promise<import("./settings.service").FeatureConfig>;
    updateFeatures(body: UpdateFeaturesDto): Promise<import("./settings.service").FeatureConfig>;
}
