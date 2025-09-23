import { Repository } from 'typeorm';
import { CredentialCode } from '../entities/credential-code.entity';
import { CredentialsService } from './credentials.service';
export declare class CredentialsController {
    private readonly svc;
    private readonly codes;
    constructor(svc: CredentialsService, codes: Repository<CredentialCode>);
    verify(code?: string): Promise<{
        ok: boolean;
        error: string;
        data?: undefined;
    } | {
        ok: boolean;
        data: {
            code: string;
            userId: string;
            status: "active" | "expired";
            rentalId: string;
            resortName: string;
        };
        error?: undefined;
    }>;
    generate(body: any): Promise<{
        ok: boolean;
        data: CredentialCode;
    }>;
}
