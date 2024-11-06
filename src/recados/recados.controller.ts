import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ReqDataParam } from 'src/common/params/req-data-param.decorator';
import { RecadosUtils } from './recados.utils';
// import { RegexProcol } from 'src/common/regex/regex.protocol';
// import { ONLY_LOWERCASE_LETTERS_REGEX, REMOVE_SPACES_REGEX } from './recados.constants';
// import { MY_DYNAMIC_CONFIG, MyDynamicModuleConfigs } from 'src/my-dynamic/my-dynamic.module';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload-param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
// import { RoutePoliceGuard } from 'src/auth/guards/route-police.guard';
// import { ROUTE_POLICY_KEY } from 'src/auth/auth.constants';
// import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
// import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
// import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';
// import { ONLY_LOWERCASE_LETTERS_REGEX, REMOVE_SPACES_REGEX, SERVER_NAME } from 'src/recados/recados.constants';
// import { RegexProcol } from 'src/common/regex/regex.protocol';

@Controller('recados')
export class RecadosController {
    constructor(
        private readonly recadosService: RecadosService,
        private readonly recadosUtils: RecadosUtils,
        // @Inject(MY_DYNAMIC_CONFIG)
        // private readonly myDynamicConfigs: MyDynamicModuleConfigs
        // @Inject(REMOVE_SPACES_REGEX)
        // private readonly removeSpacesRegex: RegexProcol,
        // @Inject(ONLY_LOWERCASE_LETTERS_REGEX)
        // private readonly onlyLowercaseLettersRegex: RegexProcol
    ){
        //console.log('RecadosController', this.myDynamicConfigs);
    }

    @Get()    
    findAll(@Query() paginationDto: PaginationDto, @ReqDataParam('url') url) {
        // console.log(this.removeSpacesRegex.execute('REMOVE OS ESPACOS'));
        // console.log(this.onlyLowercaseLettersRegex.execute('REMOVE OS ESPACOS letra minuscula'));
        // console.log(this.serverName);
        //console.log(url);
        //console.log('RecadosController', req['user'])
        return this.recadosService.findAll(paginationDto);
    }

    //@UseInterceptors(AddHeaderInterception, ErrorHandlingInterceptor)
    @UseGuards(AuthTokenGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        console.log(this.recadosUtils.inverteSetring('rafael'));
        return this.recadosService.findOne(id);
    }

    @UseGuards(AuthTokenGuard)
    //@UseGuards(AuthAndPolicyGuard)
    //@SetRoutePolicy(RoutePolicies.createReacado)
    @Post()
    create(
        @Body() createRecadoDto: CreateRecadoDto, 
        @TokenPayloadParam() tokenPayload: TokenPayloadDto
    ) {
        return this.recadosService.create(createRecadoDto, tokenPayload);
    }

    @UseGuards(AuthTokenGuard)
    //@UseGuards(AuthAndPolicyGuard)
    //@SetRoutePolicy(RoutePolicies.updateRecado)
    @Patch(':id')
    update(
        @Param('id') id: number, 
        @Body() updateRecadoDto: UpdateRecadoDto, 
        @TokenPayloadParam() tokenPayload: TokenPayloadDto
    ) {
        return this.recadosService.update(id, updateRecadoDto, tokenPayload);
    }

    @UseGuards(AuthTokenGuard)
    //@UseGuards(AuthAndPolicyGuard)
    //@SetRoutePolicy(RoutePolicies.deleteRecado)
    @Delete(':id')
    remove(
        @Param('id') id: number, 
        @TokenPayloadParam() tokenPayload: TokenPayloadDto
    ) {
        return this.recadosService.remove(id, tokenPayload);
    }
}