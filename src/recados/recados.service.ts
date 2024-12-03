import { ForbiddenException, HttpException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { Recado } from "./entities/recado.entity";
import { CreateRecadoDto } from "./dto/create-recado.dto";
import { UpdateRecadoDto } from "./dto/update-recado.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PessoasService } from "src/pessoas/pessoas.service";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { RecadosUtils } from "./recados.utils";
import { ConfigService, ConfigType } from "@nestjs/config";
import recadosConfig from "./recados.config";
import { TokenPayloadDto } from "src/auth/dto/token-payload.dto";
import { EmailService } from "src/email/email.service";
import { ResponseRecadoDto } from "./dto/response-recado.dto";

// Scope.DEFAULT => O provider em questão é um singleton, instanciado quando a aplicação inicia
// Scope.REQUEST => O provider em questão é instanciado a cada requisição
// Scope.TRANSIENT => É criada uma instância do provider para cada classe que injetar este provider

@Injectable({scope: Scope.DEFAULT})
export class RecadosService {

    constructor(
        @InjectRepository(Recado)
        private readonly recadoRepository: Repository<Recado>,
        private readonly pessoasService: PessoasService,        
        //private readonly configService: ConfigService
        //private readonly recadosUtils: RecadosUtils
        @Inject(recadosConfig.KEY)
        private readonly recadosConfiguration: ConfigType<typeof recadosConfig>,
        private readonly emailService: EmailService,
    ){
        //const databaseUsername = this.configService.get('DATABASE_USERNAME');
        //console.log(databaseUsername);
        console.log(recadosConfiguration.teste1);
    }

    async findAll(paginationDto?: PaginationDto): Promise<ResponseRecadoDto[]>{
        //console.log(this.recadosUtils.inverteSetring('rafael'));
        
        const {limit = 10, offset = 0} = paginationDto;

        const recados = await this.recadoRepository.find({
            take: limit, //quantos registros serão retornados por página
            skip: offset, //quantos registros devem ser pulados
            relations: ['de', 'para'],
            order: {
                id: 'desc'
            },
            select: {
                de: {
                    id: true,
                    nome: true
                },
                para: {
                    id: true,
                    nome: true
                }
            }
        });

        return recados;
    }

    async findOne(id: number): Promise<ResponseRecadoDto>{
        //const recado = this.recados.find(item => item.id === id);
        const recado = await this.recadoRepository.findOne({
            where: {id},
            relations: ['de', 'para'],
            select: {
                de: {
                    id: true,
                    nome: true
                },
                para: {
                    id: true,
                    nome: true
                }
            }
        });

        if(recado) return recado;

        this.throwNotFoundError();
    }

    async create(createRecadoDto: CreateRecadoDto, tokenPayload: TokenPayloadDto): Promise<ResponseRecadoDto>{
        const { paraId } = createRecadoDto;
        
        //Encontrar pessoa autor
        const de = await this.pessoasService.findOne(tokenPayload.sub);

        //Encontrar pessoa destinatário
        const para = await this.pessoasService.findOne(paraId);

        const novoRecado = {
            texto: createRecadoDto.texto,
            de,
            para,
            lido: false,
            data: new Date()
        };

        const recado = this.recadoRepository.create(novoRecado);
        await this.recadoRepository.save(recado);

        this.emailService.sendEmail(
            para.email,
            `Novo recado de ${de.nome}`,
            novoRecado.texto
        );

        return {
            ...recado,
            de: { 
                id: recado.de.id, 
                nome: recado.de.nome 
            },
            para: {
                id: recado.para.id,
                nome: recado.para.nome
            }
        }
    }

    async update(id: number, updateRecadoDto: UpdateRecadoDto, tokenPayload: TokenPayloadDto): Promise<ResponseRecadoDto>{
        const recado = await this.findOne(id);

        if(recado.de.id !== tokenPayload.sub) throw new ForbiddenException('Operação não permitida');

        recado.texto = updateRecadoDto?.texto ?? recado.texto;
        recado.lido = updateRecadoDto?.lido ?? recado.lido;

        await this.recadoRepository.save(recado);

        return recado;      
    }

    async remove(id: number, tokenPayload: TokenPayloadDto){
        const recado = await this.findOne(id);

        if(recado.de.id !== tokenPayload.sub) throw new ForbiddenException('Operação não permitida');

        await this.recadoRepository.delete(recado.id);

        return recado;
    }

    throwNotFoundError(){
        //throw new HttpException('Não localizado', 404);
        throw new NotFoundException('Não localizado');
    }
}