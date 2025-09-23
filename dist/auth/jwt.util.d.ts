export declare function signJwt(payload: Record<string, any>, secret: string, expiresInSeconds?: number): string;
export declare function verifyJwt(token: string, secret: string): Record<string, any> | null;
