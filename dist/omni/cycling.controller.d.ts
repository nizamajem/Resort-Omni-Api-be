import { Repository } from 'typeorm';
import { Rental } from '../entities/rental.entity';
import { CredentialCode } from '../entities/credential-code.entity';
type CyclingHistoryItem = {
    id: string;
    rentalId: string;
    status: 'active' | 'completed';
    state: Rental['status'];
    startedAt: number;
    endedAt?: number | null;
    guestName: string;
    resortName: string;
    roomNumber: string;
    pkg: Rental['pkg'];
    packageName: string;
    amountDue?: number | null;
    source: 'rental';
    telemetry: Record<string, unknown>;
    rental: Record<string, unknown>;
    credential?: {
        code: string;
        userId: string;
        status: CredentialCode['status'];
    };
};
export declare class CyclingController {
    private readonly rentals;
    private readonly credentials;
    constructor(rentals: Repository<Rental>, credentials: Repository<CredentialCode>);
    history(req: any, resortFilter?: string): Promise<{
        ok: boolean;
        active: CyclingHistoryItem[];
        history: CyclingHistoryItem[];
    }>;
}
export {};
