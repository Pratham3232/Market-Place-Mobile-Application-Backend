import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, of, switchMap, timeout } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(
        @Inject('AUTH_SERVICE') private authClient: ClientProxy,
        private reflector: Reflector
    ) {}

    canActivate(context: ExecutionContext): Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return of(true);
        }

        const request = context.switchToHttp().getRequest();
        const user = request['user'];

        if (!user) {
            this.logger.error('No user found in request. Ensure AuthGuard runs first');
            throw new ForbiddenException('User not authenticated');
        }

        return this.authClient.send('validate_roles', {
            userId: user.userId,
            requiredRoles
        }).pipe(
            timeout(5000), // 5 seconds timeout
            switchMap((hasAccess: boolean) => {
                if (!hasAccess) {
                    this.logger.warn(`Access denied for user ${user.userId} - Required roles: ${requiredRoles.join(', ')}`);
                    throw new ForbiddenException('Insufficient role permissions');
                }
                
                this.logger.debug(`Access granted for user ${user.userId} - Required roles: ${requiredRoles.join(', ')}`);
                return of(true);
            }),
            catchError((error) => {
                this.logger.error(`Role validation failed: ${error.message}`);
                throw new ForbiddenException('Role validation failed');
            })
        );
    }
}
