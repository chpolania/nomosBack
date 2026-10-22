import { createHash, randomBytes } from 'crypto';
import config from '../../config/config';
import { ITokenPair, ITokenPayload } from '../../domain/interfaces/auth.interface';
import {
    IAccessTokenSigner,
    IPasswordHasher,
    IRefreshTokenRepository,
    IUserRepository,
} from '../../domain/ports/auth.ports';
import { CustomError } from '../../utils/index.utils';

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export class AuthService {
    constructor(
        private readonly users: IUserRepository,
        private readonly refreshTokens: IRefreshTokenRepository,
        private readonly hasher: IPasswordHasher,
        private readonly signer: IAccessTokenSigner,
    ) {}

    async login(UUID: string, username: string, password: string): Promise<ITokenPair> {
        const user = await this.users.findByUsername(username);
        const valid = user ? await this.hasher.compare(password, user.password_hash) : false;
        if (!user || !valid) {
            throw new CustomError(UUID, 401, 'Invalid credentials');
        }
        return this.issueTokens(user.id, user.username);
    }

    async refresh(UUID: string, refreshToken: string): Promise<ITokenPair> {
        const stored = await this.refreshTokens.findByHash(sha256(refreshToken));
        if (!stored) {
            throw new CustomError(UUID, 401, 'Invalid refresh token');
        }
        if (stored.revoked_at) {
            // reutilización de un token ya rotado: se invalidan todas las sesiones del usuario
            await this.refreshTokens.revokeAllForUser(stored.user_id);
            throw new CustomError(UUID, 401, 'Refresh token reuse detected');
        }
        if (stored.expires_at.getTime() <= Date.now()) {
            throw new CustomError(UUID, 401, 'Refresh token expired');
        }
        const user = await this.users.findById(stored.user_id);
        if (!user) {
            throw new CustomError(UUID, 401, 'Invalid refresh token');
        }
        await this.refreshTokens.revoke(stored.id);
        return this.issueTokens(user.id, user.username);
    }

    async logout(refreshToken: string): Promise<void> {
        const stored = await this.refreshTokens.findByHash(sha256(refreshToken));
        if (stored && !stored.revoked_at) {
            await this.refreshTokens.revoke(stored.id);
        }
    }

    verifyAccessToken(UUID: string, token: string): ITokenPayload {
        try {
            return this.signer.verify(token);
        } catch {
            throw new CustomError(UUID, 401, 'Invalid or expired token');
        }
    }

    private async issueTokens(userId: number, username: string): Promise<ITokenPair> {
        const [roles, permissions] = await Promise.all([
            this.users.getRoleNames(userId),
            this.users.getPermissionNames(userId),
        ]);
        const accessToken = this.signer.sign({ sub: userId, username, roles, permissions });
        const refreshToken = randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + config.authConfig.REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
        await this.refreshTokens.save(userId, sha256(refreshToken), expiresAt);
        return {
            token_type: 'Bearer',
            access_token: accessToken,
            expires_in: config.authConfig.ACCESS_TTL_SECONDS,
            refresh_token: refreshToken,
        };
    }
}
