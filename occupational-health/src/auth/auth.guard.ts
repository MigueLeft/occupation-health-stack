import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Record<string, unknown>>();
    const headers = (request as { headers: Record<string, string | string[]> })
      .headers;
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (!session?.user) {
      throw new UnauthorizedException(
        'Sesión no válida. Inicia sesión nuevamente.',
      );
    }

    request.currentUser = session.user;
    return true;
  }
}
