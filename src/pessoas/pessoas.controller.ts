import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { RecadosUtils } from 'src/recados/recados.utils';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY } from 'src/auth/auth.constants';
import { TokenPayloadParam } from 'src/auth/params/token-payload-param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
//import { SERVER_NAME } from 'src/recados/recados.constants';

@Controller('pessoas')
export class PessoasController {
  constructor(
    private readonly pessoasService: PessoasService,
    //private readonly recadosUtils: RecadosUtils,
    // @Inject(SERVER_NAME)
    // private readonly nomeDaVariavel: string
  ) {}

  @Post()
  create(@Body() createPessoaDto: CreatePessoaDto) {
    return this.pessoasService.create(createPessoaDto);
  }

  @UseGuards(AuthTokenGuard)
  @Get()
  findAll(@Req() req?: Request) {    
    //console.log(req[REQUEST_TOKEN_PAYLOAD_KEY].sub);
    return this.pessoasService.findAll();
  }

  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {    
    return this.pessoasService.findOne(+id);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updatePessoaDto: UpdatePessoaDto, 
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {
    return this.pessoasService.update(+id, updatePessoaDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string, 
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {
    return this.pessoasService.remove(+id, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload-picture')
  async uploadPicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({maxSize: 10 * (1024 * 1024)}),
          new FileTypeValidator({fileType: /jpeg|jpg|png/g})
        ]
      })
    ) file: Express.Multer.File,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {    
    return this.pessoasService.uploadPicture(file, tokenPayload);
  }
}
