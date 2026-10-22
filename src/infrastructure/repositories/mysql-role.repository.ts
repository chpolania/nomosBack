import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IRole } from '../../domain/interfaces/auth.interface';
import { IRoleRepository } from '../../domain/ports/auth.ports';

export class MysqlRoleRepository implements IRoleRepository {
    constructor(private readonly db: Pool) {}

    async findByName(name: string): Promise<IRole | null> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT id, name FROM roles WHERE name = ?', [name]);
        return (rows[0] as IRole) ?? null;
    }

    async findById(id: number): Promise<IRole | null> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT id, name FROM roles WHERE id = ?', [id]);
        return (rows[0] as IRole) ?? null;
    }

    async create(name: string): Promise<IRole> {
        const [result] = await this.db.query<ResultSetHeader>('INSERT INTO roles (name) VALUES (?)', [name]);
        return { id: result.insertId, name };
    }

    async list(filter?: string): Promise<IRole[]> {
        if (!filter) {
            const [rows] = await this.db.query<RowDataPacket[]>('SELECT id, name FROM roles ORDER BY name');
            return rows as IRole[];
        }
        const escaped = filter.replace(/[\\%_]/g, '\\$&');
        const [rows] = await this.db.query<RowDataPacket[]>(
            'SELECT id, name FROM roles WHERE name LIKE ? ORDER BY name',
            [`%${escaped}%`],
        );
        return rows as IRole[];
    }

    async assignToUser(userId: number, roleId: number): Promise<boolean> {
        const [result] = await this.db.query<ResultSetHeader>(
            'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userId, roleId],
        );
        return result.affectedRows > 0;
    }

    async assignPermission(roleId: number, permissionId: number): Promise<boolean> {
        const [result] = await this.db.query<ResultSetHeader>(
            'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [roleId, permissionId],
        );
        return result.affectedRows > 0;
    }
}
