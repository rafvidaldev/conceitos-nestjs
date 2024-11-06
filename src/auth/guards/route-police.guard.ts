import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUEST_TOKEN_PAYLOAD_KEY, ROUTE_POLICY_KEY } from "../auth.constants";
import { RoutePolicies } from "../enum/route-policies.enum";
import { Pessoa } from "src/pessoas/entities/pessoa.entity";

@Injectable()
export class RoutePoliceGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const routePolicyRequired = this.reflector.get<RoutePolicies | undefined>(ROUTE_POLICY_KEY, context.getHandler());

        //Rota sem permissões configuradas
        if(!routePolicyRequired) return true;

        const request = context.switchToHttp().getRequest();
        const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY];

        if(!tokenPayload) throw new UnauthorizedException(`Rota requer permissão ${routePolicyRequired}. Usuário não logado.`);

        const {pessoa}:{pessoa: Pessoa} = tokenPayload;
    
        //if(!pessoa.routePolicies.includes(routePolicyRequired)) throw new UnauthorizedException(`Usuário não tem permissão ${routePolicyRequired}`);

        return true;
    }
}