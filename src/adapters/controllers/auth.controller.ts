import { NextFunction, Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';

import { AuthService } from '../../application/use-cases/auth.service';
import { RoleService } from '../../application/use-cases/role.service';
import { UserService } from '../../application/use-cases/user.service';
import { CustomError, getRequestUUID } from '../../utils/index.utils';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';

type Handler = (req: Request, res: Response, UUID: string) => Promise<void>;

const validate = (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const msg = errors.array().map((e: any) => `${e.path}: ${e.msg}`).join('; ');
        return next(new CustomError(getRequestUUID(req as any), 400, msg));
    }
    next();
};

export class AuthController {
    private readonly router = Router();

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly roleService: RoleService,
    ) {
        const auth = authenticate(authService);

        this.router.post('/auth/login',
            body('username').isString().trim().notEmpty(),
            body('password').isString().notEmpty(),
            validate,
            this.wrap(async (req, res, UUID) => {
                res.status(200).json(await this.authService.login(UUID, req.body.username, req.body.password));
            }));

        this.router.post('/auth/refresh',
            body('refresh_token').isString().notEmpty(),
            validate,
            this.wrap(async (req, res, UUID) => {
                res.status(200).json(await this.authService.refresh(UUID, req.body.refresh_token));
            }));

        this.router.post('/auth/logout',
            body('refresh_token').isString().notEmpty(),
            validate,
            this.wrap(async (req, res) => {
                await this.authService.logout(req.body.refresh_token);
                res.status(204).send();
            }));

        this.router.post('/users', auth, requirePermission('create_user'),
            body('username').isString().trim().isLength({ min: 3, max: 50 }),
            body('email').isEmail().isLength({ max: 100 }),
            body('password').isString().isLength({ min: 8, max: 72 }),
            validate,
            this.wrap(async (req, res, UUID) => {
                const { username, email, password } = req.body;
                res.status(201).json(await this.userService.createUser(UUID, username, email, password));
            }));

        this.router.post('/roles', auth, requirePermission('create_role'),
            body('name').isString().trim().isLength({ min: 1, max: 50 }),
            validate,
            this.wrap(async (req, res, UUID) => {
                res.status(201).json(await this.roleService.createRole(UUID, req.body.name));
            }));

        this.router.post('/users/:userId/roles', auth, requirePermission('assign_role'),
            param('userId').isInt({ min: 1 }),
            body('role_id').isInt({ min: 1 }),
            validate,
            this.wrap(async (req, res, UUID) => {
                res.status(200).json(await this.roleService.assignRoleToUser(
                    UUID, Number(req.params.userId), Number(req.body.role_id)));
            }));

        this.router.post('/roles/:roleId/permissions', auth, requirePermission('assign_permission'),
            param('roleId').isInt({ min: 1 }),
            body('permission_id').isInt({ min: 1 }),
            validate,
            this.wrap(async (req, res, UUID) => {
                res.status(200).json(await this.roleService.assignPermissionToRole(
                    UUID, Number(req.params.roleId), Number(req.body.permission_id)));
            }));
    }

    private wrap(handler: Handler) {
        return (req: Request, res: Response, next: NextFunction) => {
            handler(req, res, getRequestUUID(req as any)).catch((error: any) => {
                next(error instanceof CustomError ? error : new CustomError(getRequestUUID(req as any), 500, error.message));
            });
        };
    }

    public getRouter() {
        return this.router;
    }
}
