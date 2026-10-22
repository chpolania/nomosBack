import { IPublicUser } from '../../domain/interfaces/auth.interface';
import { IPasswordHasher, IUserRepository } from '../../domain/ports/auth.ports';
import { CustomError } from '../../utils/index.utils';

export class UserService {
    constructor(
        private readonly users: IUserRepository,
        private readonly hasher: IPasswordHasher,
    ) {}

    async listUsers(filter?: string): Promise<IPublicUser[]> {
        return this.users.list(filter?.trim() || undefined);
    }

    async createUser(UUID: string, username: string, email: string, password: string): Promise<IPublicUser> {
        if (await this.users.findByUsername(username)) {
            throw new CustomError(UUID, 409, 'Username already exists');
        }
        const passwordHash = await this.hasher.hash(password);
        try {
            return await this.users.create(username, email, passwordHash);
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new CustomError(UUID, 409, 'Username or email already exists');
            }
            throw error;
        }
    }
}
