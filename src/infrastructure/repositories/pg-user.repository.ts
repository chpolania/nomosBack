import { Pool } from 'pg';
import { IPublicUser, IUser } from '../../domain/interfaces/auth.interface';
import { IUserRepository } from '../../domain/ports/auth.ports';

export class PgUserRepository implements IUserRepository {
    constructor(private readonly db: Pool) {}

    async create(username: string, email: string, passwordHash: string): Promise<IPublicUser> {
        const { rows } = await this.db.query(
            `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)
             RETURNING id, username, email, created_at`,
            [username, email, passwordHash],
        );
        return rows[0];
    }

    async findByUsername(username: string): Promise<IUser | null> {
        const { rows } = await this.db.query('SELECT * FROM users WHERE username = $1', [username]);
        return rows[0] ?? null;
    }

    async findById(id: number): Promise<IPublicUser | null> {
        const { rows } = await this.db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
        return rows[0] ?? null;
    }

    async getRoleNames(userId: number): Promise<string[]> {
        const { rows } = await this.db.query(
            `SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = $1`,
            [userId],
        );
        return rows.map((r) => r.name);
    }

    async getPermissionNames(userId: number): Promise<string[]> {
        const { rows } = await this.db.query(
            `SELECT DISTINCT p.name FROM permissions p
             JOIN role_permissions rp ON rp.permission_id = p.id
             JOIN user_roles ur ON ur.role_id = rp.role_id
             WHERE ur.user_id = $1`,
            [userId],
        );
        return rows.map((r) => r.name);
    }
}
