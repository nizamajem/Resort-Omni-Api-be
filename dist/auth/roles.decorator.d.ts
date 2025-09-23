export declare const ROLES_KEY = "roles";
export type AppRole = 'superadmin' | 'resort';
export declare const Roles: (...roles: AppRole[]) => import("@nestjs/common").CustomDecorator<string>;
