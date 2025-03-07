import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany } from 'typeorm';
import { Flavor } from './flavor.entity';

@Entity() // SQL table === 'coffee'
export class Coffee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    brand: string;

    @JoinTable() // join table chỉ nên khai báo ở entities owner tức là class cha
    @ManyToMany(
        type => Flavor,
        (flavor) => flavor.coffees,
        {
            cascade: true, // 👈 or optionally just insert or update ['insert']
        },
    )
    flavors: Flavor[];
}