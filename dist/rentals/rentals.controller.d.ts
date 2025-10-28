import { Repository } from 'typeorm';
import { Rental } from '../entities/rental.entity';
import { SettingsService } from '../settings/settings.service';
declare class StartRentalDto {
    pkg: string;
    packageName: string;
    price: number;
    duration?: string;
    resortName?: string;
    guestName: string;
    roomNumber: string;
    credentialEmail?: string;
    credentialPassword?: string;
    billingMode?: string;
    customPackageId?: string;
    customBlockMinutes?: number;
    customBlockRate?: number;
}
declare class EndRentalDto {
    rentalId: string;
}
declare class SettleRentalDto {
    rentalId: string;
    orderId?: string;
    paymentType?: string;
}
export declare class RentalsController {
    private rentals;
    private settings;
    constructor(rentals: Repository<Rental>, settings: SettingsService);
    list(req: any, status?: string, resortNameQ?: string): Promise<Rental[]>;
    start(body: StartRentalDto, req: any): Promise<Rental | {
        error: string;
    }>;
    end(body: EndRentalDto, req: any): Promise<Rental | {
        error: string;
    }>;
    settle(body: SettleRentalDto): Promise<Rental | {
        error: string;
    }>;
    remove(id: string, req: any): Promise<{ ok: boolean } | { error: string }>;
}
export {};
