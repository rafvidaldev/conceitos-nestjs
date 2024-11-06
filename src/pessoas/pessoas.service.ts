import { ConflictException, ForbiddenException, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable({scope: Scope.DEFAULT})
export class PessoasService {

  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashingService: HashingService
  ){}

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const passwordHash = await this.hashingService.hash(createPessoaDto.password);

      const dadosPessoa = {
        nome: createPessoaDto.nome,
        passwordHash,
        email: createPessoaDto.email,
        //routePolicies: createPessoaDto.routePolicies
      };
  
      const novaPessoa = this.pessoaRepository.create(dadosPessoa);
  
      await this.pessoaRepository.save(novaPessoa);
      return novaPessoa;
    } catch (e) {
      if(e.code === 'ER_DUP_ENTRY') throw new ConflictException('E-mail já cadastrado.');

      throw e;
    }
  }

  async findAll() {
    const pessoas = await this.pessoaRepository.find({
      order: {
        id: 'desc',
      }
    });

    return pessoas;
  }

  async findOne(id: number) {
    const pessoa = await this.pessoaRepository.findOneBy({id});

    if(!pessoa) throw new NotFoundException('Pessoa não localizada');

    return pessoa;
  }

  async update(id: number, updatePessoaDto: UpdatePessoaDto, tokenPayload: TokenPayloadDto) {
    const dadosPessoa = {
      nome: updatePessoaDto.nome
    };

    if(updatePessoaDto?.password){
      const passwordHash = await this.hashingService.hash(updatePessoaDto.password);

      dadosPessoa['passwordHash'] = passwordHash;
    }

    const pessoa = await this.pessoaRepository.preload({
      id,
      ...dadosPessoa
    });

    if(!pessoa) throw new NotFoundException('Pessoa não localizada');

    if(pessoa.id !== tokenPayload.sub) throw new ForbiddenException('Operação não permitida');

    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const pessoa = await this.pessoaRepository.findOneBy({id});

    if(!pessoa) throw new NotFoundException('Pessoa não localizada');

    if(pessoa.id !== tokenPayload.sub) throw new ForbiddenException('Operação não permitida');

    return this.pessoaRepository.remove(pessoa);
  }

  async uploadPicture(file: Express.Multer.File, tokenPayload: TokenPayloadDto){
    const pessoa = await this.findOne(tokenPayload.sub);

    const fileExtension = path.extname(file.originalname).toLocaleLowerCase().substring(1);
    const fileName = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);
    
    await fs.writeFile(fileFullPath, file.buffer);

    pessoa.picture = fileName;

    await this.pessoaRepository.save(pessoa);

    return pessoa;

    // return {
    //   fieldname: file.fieldname,
    //   originalname: file.originalname,
    //   mimetype: file.mimetype,
    //   buffer: {},
    //   size: file.size
    // };
  }
}
