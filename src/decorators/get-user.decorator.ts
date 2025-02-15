import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator to extract the authenticated user from the request object.
 * Can be used to get the entire user object or specific properties.
 * 
 * Usage:
 * - @GetUser() user: User - Gets the entire user object
 * - @GetUser('email') userEmail: string - Gets a specific property
 * 
 * @param property Optional property to extract from the user object
 * @returns The user object or the specified property
 */
export const GetUser = createParamDecorator(
    (property: string | undefined, ctx: ExecutionContext) => {
        // Get the request object from the execution context
        const request = ctx.switchToHttp().getRequest();
        
        // Get the user from the request (added by AuthGuard)
        const user = request.user;

        // If no user exists in request, this means the endpoint is either public
        // or the guard didn't properly attach the user
        if (!user) {
            return null;
        }

        // If a specific property was requested, return that property
        // otherwise return the entire user object
        return property ? user[property] : user;
    }
);

/**
 * Interface defining the structure of the user object
 * that will be attached to the request by AuthGuard
 */
export interface RequestUser {
    id: string;
    email: string;
    role: string;
    iat?: number;  // JWT issued at timestamp
    exp?: number;  // JWT expiration timestamp
} 