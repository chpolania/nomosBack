import { Pool } from 'pg';
import { IStoredRefreshToken } from '../../domain/interfaces/auth.interface';
import { IRefreshTokenRepository } from '../../domain/ports/auth.ports';

export class PgRefreshTokenRepository implements IRefreshTokenRepository {
    constructor(private readonly db: Pool) {}

    async save(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
        await this.db.query(
            'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
            [userId, tokenHash, expiresAt],
        );
    }

    async findByHash(tokenHash: string): Promise<IStoredRefreshToken | null> {
        const { rows } = await this.db.query(
            'SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1',
            [tokenHash],
        );
        return rows[0] ?? null;
    }

    async revoke(id: number): Promise<void> {
        await this.db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [id]);
    }

    async revokeAllForUser(userId: number): Promise<void> {
        await this.db.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
            [userId],
        );
    }
}
