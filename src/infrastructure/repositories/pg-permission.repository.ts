import { Pool } from 'pg';
import { IPermission } from '../../domain/interfaces/auth.interface';
import { IPermissionRepository } from '../../domain/ports/auth.ports';

export class PgPermissionRepository implements IPermissionRepository {
    constructor(private readonly db: Pool) {}

    async findById(id: number): Promise<IPermission | null> {
        const { rows } = await this.db.query('SELECT * FROM permissions WHERE id = $1', [id]);
        return rows[0] ?? null;
    }

    async findByName(name: string): Promise<IPermission | null> {
        const { rows } = await this.db.query('SELECT * FROM permissions WHERE name = $1', [name]);
        return rows[0] ?? null;
    }

    async create(name: string, description?: string): Promise<IPermission> {
        const { rows } = await this.db.query(
            'INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING *',
            [name, description ?? null],
        );
        return rows[0];
    }
}
