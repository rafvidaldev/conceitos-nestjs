import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthTokenGuard } from "./auth-token.guard";
import { RoutePoliceGuard } from "./route-police.guard";
import { Observable } from "rxjs";

@Injectable()
export class AuthAndPolicyGuard implements CanActivate {
    constructor(
        private readonly authTokenGuard: AuthTokenGuard,
        private readonly routePolicyGuard: RoutePoliceGuard
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isAuthValid = await this.authTokenGuard.canActivate(context);

        if(!isAuthValid) return false;

        return this.routePolicyGuard.canActivate(context);
    }
}