import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IPermission } from '../../domain/interfaces/auth.interface';
import { IPermissionRepository } from '../../domain/ports/auth.ports';

export class MysqlPermissionRepository implements IPermissionRepository {
    constructor(private readonly db: Pool) {}

    async findById(id: number): Promise<IPermission | null> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT * FROM permissions WHERE id = ?', [id]);
        return (rows[0] as IPermission) ?? null;
    }

    async findByName(name: string): Promise<IPermission | null> {
        const [rows] = await this.db.query<RowDataPacket[]>('SELECT * FROM permissions WHERE name = ?', [name]);
        return (rows[0] as IPermission) ?? null;
    }

    async create(name: string, description?: string): Promise<IPermission> {
        const [result] = await this.db.query<ResultSetHeader>(
            'INSERT INTO permissions (name, description) VALUES (?, ?)',
            [name, description ?? null],
        );
        return { id: result.insertId, name, description: description ?? null };
    }
}
