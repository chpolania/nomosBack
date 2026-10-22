import { Pool } from 'pg';
import { IRole } from '../../domain/interfaces/auth.interface';
import { IRoleRepository } from '../../domain/ports/auth.ports';

export class PgRoleRepository implements IRoleRepository {
    constructor(private readonly db: Pool) {}

    async findByName(name: string): Promise<IRole | null> {
        const { rows } = await this.db.query('SELECT id, name FROM roles WHERE name = $1', [name]);
        return rows[0] ?? null;
    }

    async findById(id: number): Promise<IRole | null> {
        const { rows } = await this.db.query('SELECT id, name FROM roles WHERE id = $1', [id]);
        return rows[0] ?? null;
    }

    async create(name: string): Promise<IRole> {
        const { rows } = await this.db.query('INSERT INTO roles (name) VALUES ($1) RETURNING id, name', [name]);
        return rows[0];
    }

    async assignToUser(userId: number, roleId: number): Promise<boolean> {
        const { rowCount } = await this.db.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, roleId],
        );
        return (rowCount ?? 0) > 0;
    }

    async assignPermission(roleId: number, permissionId: number): Promise<boolean> {
        const { rowCount } = await this.db.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [roleId, permissionId],
        );
        return (rowCount ?? 0) > 0;
    }
}
