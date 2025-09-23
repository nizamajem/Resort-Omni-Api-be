import { Repository } from 'typeorm';
import { PackageAccount } from '../entities/package-account.entity';
import { HistoryItem } from '../entities/history-item.entity';
import { Rental } from '../entities/rental.entity';
import { SnapTokenDto } from './dto/snap-token.dto';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { SettingsService } from '../settings/settings.service';
type MidtransMode = 'sandbox' | 'production';
export declare class PaymentsController {
    private packages;
    private histories;
    private rentals;
    private readonly settings;
    private readonly pkgKeys;
    constructor(packages: Repository<PackageAccount>, histories: Repository<HistoryItem>, rentals: Repository<Rental>, settings: SettingsService);
    private resolveMode;
    private getMidtransConfig;
    status(orderId?: string, modeParam?: string): Promise<any>;
    createSnapToken(body: SnapTokenDto, req: any): Promise<{
        error: string;
        detail?: undefined;
        token?: undefined;
        redirect_url?: undefined;
        mode?: undefined;
    } | {
        error: string;
        detail: string;
        token?: undefined;
        redirect_url?: undefined;
        mode?: undefined;
    } | {
        token: any;
        redirect_url: any;
        mode: MidtransMode;
        error?: undefined;
        detail?: undefined;
    }>;
    complete(body: CompletePaymentDto, req: any): Promise<{
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
}
export {};
