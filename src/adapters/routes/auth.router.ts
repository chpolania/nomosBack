import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../application/use-cases/auth.service';
import { RoleService } from '../../application/use-cases/role.service';
import { UserService } from '../../application/use-cases/user.service';
import { pool } from '../../infrastructure/db/pool';
import { PgPermissionRepository } from '../../infrastructure/repositories/pg-permission.repository';
import { PgRefreshTokenRepository } from '../../infrastructure/repositories/pg-refresh-token.repository';
import { PgRoleRepository } from '../../infrastructure/repositories/pg-role.repository';
import { PgUserRepository } from '../../infrastructure/repositories/pg-user.repository';
import { BcryptHasher } from '../../infrastructure/security/bcrypt-hasher';
import { JwtSigner } from '../../infrastructure/security/jwt-signer';

const users = new PgUserRepository(pool);
const roles = new PgRoleRepository(pool);
const permissions = new PgPermissionRepository(pool);
const refreshTokens = new PgRefreshTokenRepository(pool);
const hasher = new BcryptHasher();

const authController = new AuthController(
    new AuthService(users, refreshTokens, hasher, new JwtSigner()),
    new UserService(users, hasher),
    new RoleService(roles, users, permissions),
);

export default authController.getRouter();
