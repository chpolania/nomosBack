import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../application/use-cases/auth.service';
import { ITokenPayload } from '../../domain/interfaces/auth.interface';
import { CustomError, getRequestUUID } from '../../utils/index.utils';

export interface IAuthenticatedRequest extends Request {
    auth?: ITokenPayload;
}

export const authenticate = (authService: AuthService) =>
    (req: IAuthenticatedRequest, _res: Response, next: NextFunction) => {
        const UUID = getRequestUUID(req as any);
        const [scheme, token] = (req.headers.authorization ?? '').split(' ');
        if (scheme?.toLowerCase() !== 'bearer' || !token) {
            return next(new CustomError(UUID, 401, 'Missing bearer token'));
        }
        try {
            req.auth = authService.verifyAccessToken(UUID, token);
            next();
        } catch (error) {
            next(error);
        }
    };

export const requirePermission = (permission: string) =>
    (req: IAuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (!req.auth?.permissions.includes(permission)) {
            return next(new CustomError(getRequestUUID(req as any), 403, 'Forbidden'));
        }
        next();
    };
