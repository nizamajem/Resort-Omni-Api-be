import { Repository } from 'typeorm';
import { ResortAccount } from '../entities/resort-account.entity';
export declare class AuthController {
    private resorts;
    constructor(resorts: Repository<ResortAccount>);
    login(body: any): Promise<{
        error: string;
        accessToken?: undefined;
        user?: undefined;
    } | {
        accessToken: string;
        user: any;
        error?: undefined;
    }>;
    me(req: any): Promise<{
        user: any;
    }>;
}
