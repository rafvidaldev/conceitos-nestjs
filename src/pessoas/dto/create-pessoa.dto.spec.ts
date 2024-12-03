import { validate } from 'class-validator';
import { CreatePessoaDto } from './create-pessoa.dto';

describe('CreatePessoaDto', () => {
    it('deve validar um DTO valido', async () => {
        const dto = new CreatePessoaDto();
        dto.email = 'teste@example.com';
        dto.password = 'password';
        dto.nome = 'Rafael Costa';

        const errors = await validate(dto);
        expect(errors.length).toBe(0); //Nenhum erro significa que o DTO é válido
    });

    it('deve falhar se o email for inválido', async () => {
        const dto = new CreatePessoaDto();
        dto.email = 'invalido';
        dto.password = 'password';
        dto.nome = 'Rafael Costa';

        const errors = await validate(dto);
        expect(errors.length).toBe(1);
        expect(errors[0].property).toBe('email');
    });

    it('deve falhar se a senha for muito curta', async () => {
        const dto = new CreatePessoaDto();
        dto.email = 'teste@example.com';
        dto.password = '123';
        dto.nome = 'Rafael Costa';

        const errors = await validate(dto);
        expect(errors.length).toBe(1);
        expect(errors[0].property).toBe('password');
    });

    it('deve falhar se o nome for vazio', async () => {
        const dto = new CreatePessoaDto();
        dto.email = 'teste@example.com';
        dto.password = 'password';
        dto.nome = '';

        const errors = await validate(dto);
        expect(errors.length).toBe(1);
        expect(errors[0].property).toBe('nome');
    });

    it('deve falhar se o nome for muito longo', async () => {
        const dto = new CreatePessoaDto();
        dto.email = 'teste@example.com';
        dto.password = 'password';
        dto.nome = 'a'.repeat(201);

        const errors = await validate(dto);
        expect(errors.length).toBe(1);
        expect(errors[0].property).toBe('nome');
    });
})