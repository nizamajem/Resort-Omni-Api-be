import { OmniService } from './omni.service';
export declare class OmniWebhookController {
    private readonly service;
    constructor(service: OmniService);
    captureRoot(req: any, body: any): Promise<{
        ok: boolean;
    }>;
}
