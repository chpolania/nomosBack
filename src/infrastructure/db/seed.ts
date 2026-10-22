import fs from 'fs';
import path from 'path';
import { createConnection } from 'mysql2/promise';
import config from '../../config/config';
import { BcryptHasher } from '../security/bcrypt-hasher';

const PERMISSIONS: Array<[string, string]> = [
    ['create_user', 'Crear usuarios'],
    ['create_role', 'Crear roles'],
    ['assign_role', 'Asignar roles a usuarios'],
    ['assign_permission', 'Asignar permisos a roles'],
];

async function seed() {
    const { HOST, PORT, USER, PASSWORD, NAME } = config.dbConfig;
    const conn = await createConnection({
        host: HOST, port: PORT, user: USER, password: PASSWORD, multipleStatements: true,
    });
    try {
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${NAME}\``);
        await conn.query(`USE \`${NAME}\``);
        await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

        for (const [name, description] of PERMISSIONS) {
            await conn.query('INSERT IGNORE INTO permissions (name, description) VALUES (?, ?)', [name, description]);
        }
        await conn.query("INSERT IGNORE INTO roles (name) VALUES ('Admin')");
        await conn.query(
            `INSERT IGNORE INTO role_permissions (role_id, permission_id)
             SELECT (SELECT id FROM roles WHERE name = 'Admin'), id FROM permissions`);

        const username = process.env.ADMIN_USERNAME ?? 'admin';
        const email = process.env.ADMIN_EMAIL ?? 'admin@nomos.co';
        const password = process.env.ADMIN_PASSWORD;
        if (!password) {
            throw new Error('ADMIN_PASSWORD is required');
        }
        await conn.query(
            'INSERT IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, await new BcryptHasher().hash(password)]);
        await conn.query(
            `INSERT IGNORE INTO user_roles (user_id, role_id)
             SELECT (SELECT id FROM users WHERE username = ?), (SELECT id FROM roles WHERE name = 'Admin')`,
            [username]);
        console.log(`Seed completed. Admin user: ${username}`);
    } finally {
        await conn.end();
    }
}

seed().catch((e) => { console.error(e); process.exitCode = 1; });
