import { IRole } from '../../domain/interfaces/auth.interface';
import {
    IPermissionRepository,
    IRoleRepository,
    IUserRepository,
} from '../../domain/ports/auth.ports';
import { CustomError } from '../../utils/index.utils';

export class RoleService {
    constructor(
        private readonly roles: IRoleRepository,
        private readonly users: IUserRepository,
        private readonly permissions: IPermissionRepository,
    ) {}

    async createRole(UUID: string, name: string): Promise<IRole> {
        if (await this.roles.findByName(name)) {
            throw new CustomError(UUID, 409, 'Role already exists');
        }
        return this.roles.create(name);
    }

    async listRoles(filter?: string): Promise<IRole[]> {
        return this.roles.list(filter?.trim() || undefined);
    }

    async assignRoleToUser(UUID: string, userId: number, roleId: number): Promise<{ userId: number; roleId: number }> {
        if (!(await this.users.findById(userId))) {
            throw new CustomError(UUID, 404, 'User not found');
        }
        if (!(await this.roles.findById(roleId))) {
            throw new CustomError(UUID, 404, 'Role not found');
        }
        await this.roles.assignToUser(userId, roleId);
        return { userId, roleId };
    }

    async assignPermissionToRole(UUID: string, roleId: number, permissionId: number): Promise<{ roleId: number; permissionId: number }> {
        if (!(await this.roles.findById(roleId))) {
            throw new CustomError(UUID, 404, 'Role not found');
        }
        if (!(await this.permissions.findById(permissionId))) {
            throw new CustomError(UUID, 404, 'Permission not found');
        }
        await this.roles.assignPermission(roleId, permissionId);
        return { roleId, permissionId };
    }
}
