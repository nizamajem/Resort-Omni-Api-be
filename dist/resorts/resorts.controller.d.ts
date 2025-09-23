import { Repository } from 'typeorm';
import { ResortAccount } from '../entities/resort-account.entity';
import { CreateResortDto } from './dto/create-resort.dto';
import { UpdateResortDto } from './dto/update-resort.dto';
export declare class ResortsController {
    private repo;
    constructor(repo: Repository<ResortAccount>);
    list(q?: string, status?: string, offset?: string, limit?: string): Promise<{
        total: number;
        data: ResortAccount[];
    }>;
    create(body: CreateResortDto): Promise<ResortAccount | {
        error: string;
    }>;
    update(body: UpdateResortDto): Promise<ResortAccount | {
        error: string;
    }>;
    remove(id: string): Promise<{
        error: string;
        removed?: undefined;
    } | {
        removed: number;
        error?: undefined;
    }>;
}
