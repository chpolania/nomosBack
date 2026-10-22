import { Pool } from 'pg';
import config from '../../config/config';

export const pool = new Pool({
    host: config.dbConfig.HOST,
    port: config.dbConfig.PORT,
    database: config.dbConfig.NAME,
    user: config.dbConfig.USER,
    password: config.dbConfig.PASSWORD,
});
