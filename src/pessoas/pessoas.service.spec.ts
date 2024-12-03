import { Not, Repository } from "typeorm";
import { PessoasService } from "./pessoas.service";
import { Pessoa } from "./entities/pessoa.entity";
import { HashingService } from "src/auth/hashing/hashing.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreatePessoaDto } from "./dto/create-pessoa.dto";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import * as path from "path";
import * as fs from 'fs/promises';

jest.mock('fs/promises'); //Mocka o módulo fs

describe('PessoasService', () => {
    let pessoasService: PessoasService;
    let pessoaRepository: Repository<Pessoa>;
    let hashingService: HashingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PessoasService,
                {
                    provide: getRepositoryToken(Pessoa),
                    useValue: {
                        save: jest.fn(),
                        create: jest.fn(),
                        findOneBy: jest.fn(),
                        find: jest.fn(),
                        preload: jest.fn(),
                        remove: jest.fn()
                    }
                },
                {
                    provide: HashingService,
                    useValue: {
                        hash: jest.fn()
                    }
                }
            ]
        }).compile();

        pessoasService = module.get<PessoasService>(PessoasService);
        pessoaRepository = module.get<Repository<Pessoa>>(getRepositoryToken(Pessoa));
        hashingService = module.get<HashingService>(HashingService);
    });

    //um caso - teste
    it('pessoaService deve estar definido', () => {
        expect(pessoasService).toBeDefined();
    });

    describe('create', () => {
        it('deve criar uma nova pessoa', async () => {
            //Arrange
            //CreatePessoaDto
            const createPessoaDto: CreatePessoaDto = {
                email: 'rafael@email.com',
                nome: 'Rafael',
                password: '123456'
            };
            const passwordHash = 'HASHDESENHA';
            const novaPessoa = {
                id: 1, 
                nome: createPessoaDto.nome,                
                email: createPessoaDto.email,
                passwordHash
            };

            //Como o valor retornado por hashingService.hash é necessário, vamos simular este valor
            jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);

            //Como o valor retornado por pessoaRepository.create é necessário em pessoaRepository.save, vamos simular este valor
            jest.spyOn(pessoaRepository, 'create').mockReturnValue(novaPessoa as any);

            //Act
            const result = await pessoasService.create(createPessoaDto);

            //Assert
            //O método hashingService.hash foi chamado com createPessoaDto.password
            expect(hashingService.hash).toHaveBeenCalledWith(createPessoaDto.password);

            //O método pessoaRepository.create foi chamado com os dados da nova pessoa com o hash de senha gerado por hashingService.hash
            expect(pessoaRepository.create).toHaveBeenCalledWith({
                nome: createPessoaDto.nome,
                passwordHash,
                email: createPessoaDto.email,
            });

            //O método pessoaRepository.save foi chamado com os dados da nova pessoa gerada por pessoaRepository.create
            expect(pessoaRepository.save).toHaveBeenCalledWith(novaPessoa);

            //O resultado do método pessoaService.create retornou a nova pessoa criada
            expect(result).toEqual(novaPessoa);
        });

        it('deve lançar ConflitException quando e-mail já existe', async () => {
            jest.spyOn(pessoaRepository, 'save').mockRejectedValue({
                code: 'ER_DUP_ENTRY'
            });

            await expect(pessoasService.create({} as any)).rejects.toThrow(ConflictException);
        });

        it('deve lançar um erro genérico quando um erro ocorrer', async () => {
            jest.spyOn(pessoaRepository, 'save').mockRejectedValue(new Error('Erro genérico'));

            await expect(pessoasService.create({} as any)).rejects.toThrow(new Error('Erro genérico'));
        });
    });

    describe('findOne', () => {
        it('deve retornar uma pessoa se a pessoa for encontrada', async () => {
            const pessoaId = 1;
            const pessoaEncontrada = {
                id: pessoaId,
                nome: 'Rafael',
                email: 'rafael@email.com',
                passwordHash: 'PASSWORDHASH'
            }

            jest.spyOn(pessoaRepository, 'findOneBy').mockResolvedValue(pessoaEncontrada as any);

            const result = await pessoasService.findOne(pessoaId);

            expect(result).toEqual(pessoaEncontrada);
        });

        it('deve retornar NotFoundException se a pessoa não for encontrada', async () => {
            await expect(pessoasService.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('deve retornar todas as pessoas', async () => {
            const pessoasMock: Pessoa[] = [
                {
                    id: 1,
                    nome: 'Rafael',
                    email: 'rafael@email.com',
                    passwordHash: 'PASSWORDHASH'
                } as Pessoa
            ];

            jest.spyOn(pessoaRepository, 'find').mockResolvedValue(pessoasMock);

            const result = await pessoasService.findAll();

            expect(result).toEqual(pessoasMock);
            expect(pessoaRepository.find).toHaveBeenCalledWith({
                order: {
                    id: 'desc'
                }
            })
        });
    });

    describe('update', () => {
        it('deve atualizar uma pessoa se houver autorização', async () => {
            //Arrange
            const pessoaId = 1;
            const updatePessoaDto = {nome: 'Joana', password: '666666'};
            const tokenPayload = {sub: pessoaId} as any;
            const passwordHash = 'HASHDESENHA';
            const updatedPessoa = {id: pessoaId, nome: 'Joana', passwordHash};

            jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
            jest.spyOn(pessoaRepository, 'preload').mockResolvedValue(updatedPessoa as any);
            jest.spyOn(pessoaRepository, 'save').mockResolvedValue(updatedPessoa as any);

            //Act
            const result = await pessoasService.update(pessoaId, updatePessoaDto, tokenPayload);

            //Assert            
            expect(hashingService.hash).toHaveBeenCalledWith(updatePessoaDto.password);
            expect(pessoaRepository.preload).toHaveBeenCalledWith({
                id: pessoaId,
                nome: updatePessoaDto.nome,
                passwordHash,
            });
            expect(pessoaRepository.save).toHaveBeenCalledWith(updatedPessoa);
            expect(result).toEqual(updatedPessoa);
        });

        it('deve lançar ForbiddenException se o usuário não for autorizado', async () => {
            //Arrange
            const pessoaId = 1;
            const tokenPayload = {sub: 2} as any;
            const updatePessoaDto = {nome: 'João'};
            const existingPessoa = {id: pessoaId, nome: 'Joana'};

            //Simula que a pessoa já existe
            jest.spyOn(pessoaRepository, 'preload').mockResolvedValue(existingPessoa as any);

            //Act e assert
            await expect(pessoasService.update(pessoaId, updatePessoaDto, tokenPayload)).rejects.toThrow(ForbiddenException);
        });

        it('deve lançar NotFoundException se a pessoa não for localizada', async () => {
            //Arrange
            const pessoaId = 1;
            const tokenPayload = {sub: pessoaId} as any;
            const updatePessoaDto = {nome: 'João'};

            //Simula que preload retornou null
            jest.spyOn(pessoaRepository, 'preload').mockResolvedValue(null);

            //Act e assert
            await expect(pessoasService.update(pessoaId, updatePessoaDto, tokenPayload)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('deve remover uma pessoa se houver autorização', async () => {
            //Arrange
            const pessoaId = 1;
            const tokenPayload = {sub: pessoaId} as any;
            const existingPessoa = {id: pessoaId, nome: 'Joana'}

            //findOne do service retorna a pessoa existente
            jest.spyOn(pessoasService, 'findOne').mockResolvedValue(existingPessoa as any);

            //método remove do repositório também retorna a pessoa existente
            jest.spyOn(pessoaRepository, 'remove').mockResolvedValue(existingPessoa as any);

            //Act
            const result = await pessoasService.remove(pessoaId, tokenPayload);

            //Assert
            //findOne doo pessoaService chamado com o ID da pessoa
            expect(pessoasService.findOne).toHaveBeenCalledWith(pessoaId);

            //remove do repositório chamado com a pessoa existente
            expect(pessoaRepository.remove).toHaveBeenCalledWith(existingPessoa);

            //pessoa removida seja retornada
            expect(result).toEqual(existingPessoa);
        });

        it('deve lançar ForbiddenException se o usuário não for autorizado', async () => {
            //Arrange
            const pessoaId = 1;
            const tokenPayload = {sub: 2} as any;
            const existingPessoa = {id: pessoaId, nome: 'Joana'};

            //findOne chamado com a pessoa existente
            jest.spyOn(pessoasService, 'findOne').mockResolvedValue(existingPessoa as any);

            //Act e assert
            await expect(pessoasService.remove(pessoaId, tokenPayload)).rejects.toThrow(ForbiddenException);
        });

        it('deve lançar NotFoundException se a pessoa não for localizada', async () => {
            //Arrange
            const pessoaId = 1;
            const tokenPayload = {sub: pessoaId} as any;

            //findOne lança NotFoundException
            jest.spyOn(pessoasService, 'findOne').mockRejectedValue(new NotFoundException());

            //remove lança NotFoundException
            await expect(pessoasService.remove(pessoaId, tokenPayload)).rejects.toThrow(NotFoundException);
        });
    });

    describe('uploadPicture', () => {
        it('deve salvar a imagem e atualizar a pessoa', async () => {
            //Arrange
            const mockFile = {
                originalname: 'test.png',
                size: 2000,
                buffer: Buffer.from('file content')
            } as Express.Multer.File;

            const mockPessoa = {
                id: 1,
                nome: 'Rafael',
                email: 'rafael@email.com'
            } as Pessoa;

            const tokenPayload = {sub: 1} as any;

            jest.spyOn(pessoasService, 'findOne').mockResolvedValue(mockPessoa);
            jest.spyOn(pessoaRepository, 'save').mockResolvedValue({
                ...mockPessoa,
                picture: '1.png'
            });

            const filePath = path.resolve(process.cwd(), 'pictures', '1.png');

            //Act
            const result = await pessoasService.uploadPicture(mockFile, tokenPayload);

            //Assert
            expect(fs.writeFile).toHaveBeenCalledWith(filePath, mockFile.buffer);
            expect(pessoaRepository.save).toHaveBeenCalledWith({
                ...mockPessoa,
                picture: '1.png'
            });
            expect(result).toEqual({
                ...mockPessoa,
                picture: '1.png'
            });
        });

        it('deve lançar NotFoundException se a pessoa não for encontrada', async () => {
            //Arrange
            const mockFile = {
                originalname: 'test.png',
                size: 2000,
                buffer: Buffer.from('file content')
            } as Express.Multer.File;

            const tokenPayload = {sub: 1} as any;

            jest.spyOn(pessoasService, 'findOne').mockRejectedValue(new NotFoundException());

            //Act e assert
            await expect(pessoasService.uploadPicture(mockFile, tokenPayload)).rejects.toThrow(NotFoundException);
        })
    });
});