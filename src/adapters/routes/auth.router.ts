import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../application/use-cases/auth.service';
import { RoleService } from '../../application/use-cases/role.service';
import { UserService } from '../../application/use-cases/user.service';
import { pool } from '../../infrastructure/db/pool';
import { MysqlPermissionRepository } from '../../infrastructure/repositories/mysql-permission.repository';
import { MysqlRefreshTokenRepository } from '../../infrastructure/repositories/mysql-refresh-token.repository';
import { MysqlRoleRepository } from '../../infrastructure/repositories/mysql-role.repository';
import { MysqlUserRepository } from '../../infrastructure/repositories/mysql-user.repository';
import { BcryptHasher } from '../../infrastructure/security/bcrypt-hasher';
import { JwtSigner } from '../../infrastructure/security/jwt-signer';

const users = new MysqlUserRepository(pool);
const roles = new MysqlRoleRepository(pool);
const permissions = new MysqlPermissionRepository(pool);
const refreshTokens = new MysqlRefreshTokenRepository(pool);
const hasher = new BcryptHasher();

const authController = new AuthController(
    new AuthService(users, refreshTokens, hasher, new JwtSigner()),
    new UserService(users, hasher),
    new RoleService(roles, users, permissions),
);

export default authController.getRouter();
