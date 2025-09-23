import { Repository } from 'typeorm';
import { PackageAccount } from '../entities/package-account.entity';
import { HistoryItem } from '../entities/history-item.entity';
import { Rental } from '../entities/rental.entity';
import { CashOrderDto } from './dto/cash-order.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { SettingsService } from '../settings/settings.service';
export declare class OrdersController {
    private packages;
    private histories;
    private rentals;
    private readonly settings;
    private readonly pkgKeys;
    constructor(packages: Repository<PackageAccount>, histories: Repository<HistoryItem>, rentals: Repository<Rental>, settings: SettingsService);
    availability(): Promise<{
        enabled: Record<"1h" | "3h" | "1d", boolean>;
        "1h": number;
        "3h": number;
        "1d": number;
    }>;
    cash(body: CashOrderDto): Promise<{
        error: string;
        credential?: undefined;
        history?: undefined;
        rental?: undefined;
    } | {
        credential: {
            email: string;
            password: string;
        };
        history: HistoryItem;
        rental: Rental;
        error?: undefined;
    } | {
        credential: {
            email: string;
            password: string;
        };
        history: HistoryItem;
        error?: undefined;
        rental?: undefined;
    }>;
    history(query: HistoryQueryDto, req: any): Promise<HistoryItem[]>;
}
