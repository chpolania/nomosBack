import {
    IPermission,
    IPublicUser,
    IRole,
    IStoredRefreshToken,
    IUser,
} from '../interfaces/auth.interface';

export interface IUserRepository {
    create(username: string, email: string, passwordHash: string): Promise<IPublicUser>;
    findByUsername(username: string): Promise<IUser | null>;
    findById(id: number): Promise<IPublicUser | null>;
    list(filter?: string): Promise<IPublicUser[]>;
    getRoleNames(userId: number): Promise<string[]>;
    getPermissionNames(userId: number): Promise<string[]>;
}

export interface IRoleRepository {
    findByName(name: string): Promise<IRole | null>;
    findById(id: number): Promise<IRole | null>;
    create(name: string): Promise<IRole>;
    list(filter?: string): Promise<IRole[]>;
    assignToUser(userId: number, roleId: number): Promise<boolean>;
    assignPermission(roleId: number, permissionId: number): Promise<boolean>;
}

export interface IPermissionRepository {
    findById(id: number): Promise<IPermission | null>;
    findByName(name: string): Promise<IPermission | null>;
    create(name: string, description?: string): Promise<IPermission>;
}

export interface IRefreshTokenRepository {
    save(userId: number, tokenHash: string, expiresAt: Date): Promise<void>;
    findByHash(tokenHash: string): Promise<IStoredRefreshToken | null>;
    revoke(id: number): Promise<void>;
    revokeAllForUser(userId: number): Promise<void>;
}

export interface IPasswordHasher {
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}

export interface IAccessTokenSigner {
    sign(payload: { sub: number; username: string; roles: string[]; permissions: string[] }): string;
    verify(token: string): { sub: number; username: string; roles: string[]; permissions: string[] };
}
