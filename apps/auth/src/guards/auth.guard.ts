import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        // console.log('Extracted token:', token);
        if (!token) {
            console.log('No token provided in request');
            throw new UnauthorizedException('No token provided');
        }
        try {
            const userId = await this.authService.validateToken(token);
            console.log('Token validated successfully for user:', userId);
            request['userId'] = userId;
            return true;
        } catch (error) {
            console.error('Token validation failed:', error.message);
            throw new UnauthorizedException('Token validation failed: ' + error.message);
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        if (request?.headers?.authorization) {
            const [type, token] = request.headers.authorization.split(' ');
            return type === 'Bearer' ? token : undefined;
        } else if (request.token) {
            return request.token;
        }
        return undefined;
    }
}