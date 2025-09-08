import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, of, switchMap, timeout } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) { }

    canActivate(context: ExecutionContext): Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        
        if (!token) {
            this.logger.error('No token provided in request');
            throw new UnauthorizedException('Authentication token is missing');
        }

        return this.authClient.send('validate_token', { token }).pipe(
            timeout(5000), // 5 seconds timeout for RMQ response
            switchMap((response: { userId: string, roles: string[] }) => {
                if (!response || !response.userId) {
                    this.logger.error('Invalid token or user not found');
                    throw new UnauthorizedException('Invalid authentication token');
                }
                
                // Store user information in request for later use
                request['user'] = {
                    userId: response.userId,
                    roles: response.roles
                };
                
                this.logger.debug(`User authenticated: ${response.userId}`);
                return of(true);
            }),
            catchError((error) => {
                this.logger.error(`Authentication failed: ${error.message}`);
                throw new UnauthorizedException('Authentication failed');
            }),
        );
    }

    private extractTokenFromHeader(request: any): string | undefined {
        if (request?.headers?.authorization) {
            const [type, token] = request.headers.authorization.split(' ');
            return type === 'Bearer' ? token : undefined;
        }
        return undefined;
    }
}