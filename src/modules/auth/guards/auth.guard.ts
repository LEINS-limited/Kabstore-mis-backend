import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private reflector: Reflector,
        private usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        
        if (!token) {
            throw new UnauthorizedException("No token provided");
        }

        try {
            // Verify the JWT token
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('SECRET_KEY')
            });

            // Check if user still exists and is active
            const user = await this.usersService.getUserById(payload.sub, payload.email);
            if (!user) {
                throw new UnauthorizedException("User no longer exists");
            }

            if (user.status.toLowerCase() !== 'active') {
                throw new UnauthorizedException("User account is deactivated");
            }

            // Add user to request object
            request.user = {
                ...payload,
                id: user.id,
                email: user.email,
                roles: user.roles
            };
            console.log("request.user",request.user);
           return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException("Invalid or expired token");
        }
        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}