import bcrypt from 'bcryptjs';
import config from '../../config/config';
import { IPasswordHasher } from '../../domain/ports/auth.ports';

// bcrypt genera un salt aleatorio por cada hash, por lo que el hash es único por usuario
export class BcryptHasher implements IPasswordHasher {
    hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, config.authConfig.BCRYPT_ROUNDS);
    }

    compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}
