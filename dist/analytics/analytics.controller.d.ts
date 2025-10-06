import { Repository } from "typeorm";
import { HistoryItem } from "../entities/history-item.entity";
import { Rental } from "../entities/rental.entity";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";
import { BusinessVisualizationQueryDto } from "./dto/business-visualization-query.dto";
import { SettingsService } from "../settings/settings.service";
export declare class AnalyticsController {
    private readonly histories;
    private readonly rentals;
    private readonly settingsService;
    constructor(histories: Repository<HistoryItem>, rentals: Repository<Rental>, settingsService: SettingsService);
    summary(q: AnalyticsQueryDto): Promise<any>;
    private buildBusinessVisualization;
    businessVisualization(query: BusinessVisualizationQueryDto): Promise<any>;
    regenerateInsights(body: BusinessVisualizationQueryDto): Promise<{ insights: any; }>;
    private generateInsights;
}
