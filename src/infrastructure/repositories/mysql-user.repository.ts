import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IPublicUser, IUser } from '../../domain/interfaces/auth.interface';
import { IUserRepository } from '../../domain/ports/auth.ports';

export class MysqlUserRepository implements IUserRepository {
    constructor(private readonly db: Pool) {}

    async create(username: string, email: string, passwordHash: string): Promise<IPublicUser> {
        const [result] = await this.db.query<ResultSetHeader>(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash],
        );
        return (await this.findById(result.insertId)) as IPublicUser;
    }

    async findByUsername(username: string): Promise<IUser | null> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
        return (rows[0] as IUser) ?? null;
    }

    async findById(id: number): Promise<IPublicUser | null> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
        return (rows[0] as IPublicUser) ?? null;
    }

    async list(filter?: string): Promise<IPublicUser[]> {
        const base = 'SELECT id, username, email, created_at FROM users';
        if (!filter) {
            const [rows] = await this.db.query<RowDataPacket[]>(`${base} ORDER BY username`);
            return rows as IPublicUser[];
        }
        const escaped = filter.replace(/[\\%_]/g, '\\$&');
        const [rows] = await this.db.query<RowDataPacket[]>(
            `${base} WHERE username LIKE ? ORDER BY username`,
            [`%${escaped}%`],
        );
        return rows as IPublicUser[];
    }

    async getRoleNames(userId: number): Promise<string[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = ?',
            [userId],
        );
        return rows.map((r) => r.name);
    }

    async getPermissionNames(userId: number): Promise<string[]> {
        const [rows] = await this.db.query<RowDataPacket[]>(
            `SELECT DISTINCT p.name FROM permissions p
             JOIN role_permissions rp ON rp.permission_id = p.id
             JOIN user_roles ur ON ur.role_id = rp.role_id
             WHERE ur.user_id = ?`,
            [userId],
        );
        return rows.map((r) => r.name);
    }
}
