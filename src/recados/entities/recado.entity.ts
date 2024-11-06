import { Pessoa } from "src/pessoas/entities/pessoa.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Recado {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 255})
    texto: string;    

    @Column({default: false})
    lido: boolean;

    @Column()
    data: Date; // createdAt

    @CreateDateColumn()
    createdAt?: Date; // createdAt

    @UpdateDateColumn()
    updatedAt?: Date; // updatedAt

    @ManyToOne(() => Pessoa, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn({name: 'de'})
    de: Pessoa;

    @ManyToOne(() => Pessoa, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn({name: 'para'})
    para: Pessoa;
}