import { Repository } from 'typeorm';
import { CredentialCode } from '../entities/credential-code.entity';
export declare class CredentialsService {
    private readonly codes;
    constructor(codes: Repository<CredentialCode>);
    generate(resortName: string, rentalId?: string | null): Promise<CredentialCode>;
    verify(code: string): Promise<CredentialCode | null>;
    expireByRental(rentalId: string): Promise<void>;
}
