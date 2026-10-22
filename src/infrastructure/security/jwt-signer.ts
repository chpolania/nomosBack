import jwt from 'jsonwebtoken';
import config from '../../config/config';
import { IAccessTokenSigner } from '../../domain/ports/auth.ports';

export class JwtSigner implements IAccessTokenSigner {
    private get secret(): string {
        if (!config.authConfig.ACCESS_SECRET) {
            throw new Error('JWT_ACCESS_SECRET is not configured');
        }
        return config.authConfig.ACCESS_SECRET;
    }

    sign(payload: { sub: number; username: string; roles: string[]; permissions: string[] }): string {
        const { sub, ...claims } = payload;
        return jwt.sign(claims, this.secret, {
            subject: String(sub),
            expiresIn: config.authConfig.ACCESS_TTL_SECONDS,
            algorithm: 'HS256',
        });
    }

    verify(token: string) {
        const decoded = jwt.verify(token, this.secret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
        return {
            sub: Number(decoded.sub),
            username: decoded.username as string,
            roles: (decoded.roles ?? []) as string[],
            permissions: (decoded.permissions ?? []) as string[],
        };
    }
}
