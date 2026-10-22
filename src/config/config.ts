import 'dotenv/config';

const dbConfig = {
    HOST: process.env.DB_HOST ?? 'localhost',
    PORT: parseInt(process.env.DB_PORT ?? '3306', 10),
    NAME: process.env.DB_NAME ?? 'NomosDB',
    USER: process.env.DB_USER ?? 'root',
    PASSWORD: process.env.DB_PASSWORD ?? '',
}

const authConfig = {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? '',
    ACCESS_TTL_SECONDS: 3600,
    REFRESH_TTL_DAYS: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS ?? '7', 10),
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
}

const basicConfig = {
    API_PATH: process.env.API_PATH ?? '/v1/product',
    DEBUG: process.env.DEBUG ?? 'mati-arqsw:*',
    PORT: process.env.PORT ?? '9080'
}

export default {
    basicConfig,
    dbConfig,
    authConfig,
}
