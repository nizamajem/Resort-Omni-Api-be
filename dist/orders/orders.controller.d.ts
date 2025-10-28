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
    availability(req: any): Promise<Record<string, number> & {
        enabled: Record<string, boolean>;
    }>;
    cash(body: CashOrderDto, req: any): Promise<{
        error: string;
        credential?: undefined;
        history?: undefined;
        rental?: undefined;
    } | {
        credential: {
            email: string;
            password: string;
        } | null;
        history: HistoryItem;
        rental?: Rental;
        error?: undefined;
    }>;
    history(query: HistoryQueryDto, req: any): Promise<HistoryItem[]>;
    removeHistory(id: string, req: any): Promise<{ ok: boolean } | { error: string }>;
}
