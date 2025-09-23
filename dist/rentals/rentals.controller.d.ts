import { Repository } from 'typeorm';
import { Rental } from '../entities/rental.entity';
declare class StartRentalDto {
    pkg: '1h' | '3h' | '1d';
    packageName: string;
    price: number;
    duration?: string;
    resortName?: string;
    guestName: string;
    roomNumber: string;
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
    constructor(rentals: Repository<Rental>);
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
}
export {};
