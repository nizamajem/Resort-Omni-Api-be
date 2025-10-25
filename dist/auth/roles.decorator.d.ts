export declare const ROLES_KEY = "roles";
export type AppRole = 'superadmin' | 'resort' | 'partnership';
export declare const Roles: (...roles: AppRole[]) => import("@nestjs/common").CustomDecorator<string>;
