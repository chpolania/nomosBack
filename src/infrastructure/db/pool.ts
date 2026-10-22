import { createPool } from 'mysql2/promise';
import config from '../../config/config';

export const pool = createPool({
    host: config.dbConfig.HOST,
    port: config.dbConfig.PORT,
    database: config.dbConfig.NAME,
    user: config.dbConfig.USER,
    password: config.dbConfig.PASSWORD,
    timezone: 'Z',
});
