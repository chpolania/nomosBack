export interface IUser {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
}

export type IPublicUser = Omit<IUser, 'password_hash'>;

export interface IRole {
    id: number;
    name: string;
}

export interface IPermission {
    id: number;
    name: string;
    description: string | null;
}

export interface ITokenPayload {
    sub: number;
    username: string;
    roles: string[];
    permissions: string[];
}

export interface ITokenPair {
    token_type: 'Bearer';
    access_token: string;
    expires_in: number;
    refresh_token: string;
}

export interface IStoredRefreshToken {
    id: number;
    user_id: number;
    expires_at: Date;
    revoked_at: Date | null;
}
