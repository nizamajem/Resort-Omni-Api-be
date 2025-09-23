import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { OmniService } from './omni.service';
export declare class OmniLoggerMiddleware implements NestMiddleware {
    private readonly omni;
    constructor(omni: OmniService);
    use(req: Request, res: Response, next: NextFunction): void;
}
