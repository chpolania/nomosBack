import fs from 'fs';
import path from 'path';
import { pool } from './pool';
import { BcryptHasher } from '../security/bcrypt-hasher';

const PERMISSIONS: Array<[string, string]> = [
    ['create_user', 'Crear usuarios'],
    ['create_role', 'Crear roles'],
    ['assign_role', 'Asignar roles a usuarios'],
    ['assign_permission', 'Asignar permisos a roles'],
];

async function seed() {
    await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    for (const [name, description] of PERMISSIONS) {
        await pool.query(
            'INSERT INTO permissions (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
            [name, description]);
    }
    const { rows: [role] } = await pool.query(
        `INSERT INTO roles (name) VALUES ('Admin')
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`);
    await pool.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions ON CONFLICT DO NOTHING`, [role.id]);

    const username = process.env.ADMIN_USERNAME ?? 'admin';
    const email = process.env.ADMIN_EMAIL ?? 'admin@nomos.co';
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
        throw new Error('ADMIN_PASSWORD is required');
    }
    const { rows: [user] } = await pool.query(
        `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)
         ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username RETURNING id`,
        [username, email, await new BcryptHasher().hash(password)]);
    await pool.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [user.id, role.id]);
    console.log(`Seed completed. Admin user: ${username}`);
}

seed()
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => pool.end());
