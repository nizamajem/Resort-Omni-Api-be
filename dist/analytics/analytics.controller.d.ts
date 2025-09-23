import { Repository } from 'typeorm';
import { HistoryItem } from '../entities/history-item.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsController {
    private histories;
    constructor(histories: Repository<HistoryItem>);
    summary(q: AnalyticsQueryDto): Promise<{
        range: {
            start: string;
            end: string;
            groupBy: "month" | "week" | "day";
        };
        resorts: {
            resortName: string;
            orders: number;
            revenue: number;
        }[];
        series: {
            resortName: string;
            period: string;
            orders: number;
            revenue: number;
        }[];
        byPayment: {
            resortName: string;
            cash: {
                orders: number;
                revenue: number;
            };
            online: {
                orders: number;
                revenue: number;
            };
        }[];
    }>;
}
