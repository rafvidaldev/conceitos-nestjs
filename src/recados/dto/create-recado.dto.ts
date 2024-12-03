import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class CreateRecadoDto {
    @ApiProperty({
        example: 'Este é um recado de exemplo',
        description: 'Conteúdo do recado',
        minLength: 5,
        maxLength: 255
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    readonly texto: string;
    
    @IsPositive()
    paraId: number;
}
