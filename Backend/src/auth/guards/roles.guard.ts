import { Injectable } from "@nestjs/common";
import { CanActivate } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { Role } from "src/common/enums/role.enum";

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {

    const roles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return roles.includes(user.role);
  }
}