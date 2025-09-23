import { OmniService } from './omni.service';
export declare class RootOmniController {
    private readonly omni;
    constructor(omni: OmniService);
    root(req: any, query: any, headers: Record<string, any>, body: any): Promise<string>;
}
