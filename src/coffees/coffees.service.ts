import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/event.entity';
import { Connection, Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
// import { COFFEE_BRANDS } from './coffees.constances';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

@Injectable()
export class CoffeesService {

    constructor(
        @InjectRepository(Coffee) private readonly coffeeRepository: Repository<Coffee>,
        @InjectRepository(Flavor) private readonly flavorRepository: Repository<Flavor>,
        private readonly connection: Connection,
        private readonly configService: ConfigService,
        @Inject(coffeesConfig.KEY) private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
        // @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    ) {
        // console.log(coffeeBrands);
        const databaseHost = this.configService.get<string>('database.host', 'localhost');
        const coffeeConfig = this.configService.get('coffees');
        const coffeeFooConfig = this.configService.get('coffees.foo');
        console.log(coffeeConfig);
        console.log(coffeeFooConfig);
        console.log(databaseHost);
        console.log(coffeesConfiguration.foo);
    }

    async findAll(paginationQuery: PaginationQueryDto) {
        const { limit, offset } = paginationQuery;
        return this.coffeeRepository.find({
            relations: ['flavors'],
            skip: offset,
            take: limit,
        });
    }

    async findOne(id: string) {
        const coffee = await this.coffeeRepository.findOne({
            where: { id: parseInt(id) }
        });
        if (!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
    }

    async create(createCoffeeDto: CreateCoffeeDto) {
        const flavors = await Promise.all(
            createCoffeeDto.flavors.map(flavor => this.preloadFlavorByName(flavor))
        );

        const coffee = this.coffeeRepository.create({
            ...createCoffeeDto,
            flavors,
        });
        return this.coffeeRepository.save(coffee);
    }

    async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
        const flavors =
            updateCoffeeDto.flavors &&
            (await Promise.all(
                updateCoffeeDto.flavors.map(flavor => this.preloadFlavorByName(flavor))
            ));
            
        const coffee = await this.coffeeRepository.preload({
            id: +id,
            ...updateCoffeeDto,
            flavors
        });
        if (!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return this.coffeeRepository.save(coffee);
    }

    async remove(id: string) {
        const coffee = await this.findOne(id);
        return this.coffeeRepository.remove(coffee);
    }

    async preloadFlavorByName(name: string): Promise<Flavor> {
        const existingFlavor = await this.flavorRepository.findOne({
            where: {
                name,
            }
        });

        if (existingFlavor) {
            return existingFlavor;
        }

        return this.flavorRepository.create({ name });
    }

    async recommendCoffee(coffee: Coffee) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            coffee.recommendations++;
            const recommendEvent = new Event();
            recommendEvent.name = 'recommend_coffee';
            recommendEvent.type = 'coffee';
            recommendEvent.payload = { coffeeId: coffee.id };
            
            await queryRunner.manager.save(coffee);
            await queryRunner.manager.save(recommendEvent);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
