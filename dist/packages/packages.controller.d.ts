import { Repository } from 'typeorm';
import { PackageAccount } from '../entities/package-account.entity';
import { AddBatchDto } from './dto/add-batch.dto';
import { UpdatePackageAccountDto } from './dto/update-package-account.dto';
export declare class PackagesController {
    private repo;
    constructor(repo: Repository<PackageAccount>);
    list(pkg?: string, status?: string, q?: string, offset?: string, limit?: string): Promise<{
        total: number;
        data: PackageAccount[];
    }>;
    addBatch(body: AddBatchDto): Promise<{
        error: string;
        inserted?: undefined;
    } | {
        inserted: number;
        error?: undefined;
    }>;
    update(body: UpdatePackageAccountDto): Promise<PackageAccount | {
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
