import { Injectable, Module } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constances';
import { Connection } from 'typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
    controllers: [CoffeesController],
    providers: [
        CoffeesService,
        {
            provide: COFFEE_BRANDS, // use this way for constances or enum
            useFactory: async (connection: Connection): Promise<string[]> => {
                // const coffeeBrands = await connection.query('SELECT DISTINCT brand FROM coffee');
                // fake query db to get coffee brands
                const coffeeBrands = await Promise.resolve(['buddy brew', 'nescafe']);
                console.log('[!] Async factory');
                return coffeeBrands;
            }
        }
    ],
    exports: [CoffeesService],
})
export class CoffeesModule { }


// class MockCoffeeService { } // cách này không tốt vì không thể inject các dependencies khác và khi chạy trên production sẽ không thể thay thế
// @Injectable()
// export class ConfigService {}
// class DevelopmentConfigService {}
// class ProductionConfigService {}

// @Injectable()
// export class CoffeeBrandsFactory {
//     create() {
//         // logic here call api, query database
//         return ['buddy brew', 'nescafe'];
//     }
// }

// @Module({
//     imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
//     controllers: [CoffeesController],
//     // providers: [CoffeesService], // this is short hand
//     // replace the provider with the mock service
//     // providers: [{ 
//     //     provide: CoffeesService,
//     //     useValue: new MockCoffeeService() 
//     // }],
//     // provider with string token
//     providers: [
//         CoffeesService,
//         CoffeeBrandsFactory,
//         {
//             provide: ConfigService,
//             useClass: process.env.NODE_ENV === 'development' ? DevelopmentConfigService : ProductionConfigService
//         },
//         // {
//         //     provide: COFFEE_BRANDS, // use this way for constances or enum
//         //     useValue: ['buddy brew', 'nescafe']
//         // }
//         {
//             provide: COFFEE_BRANDS,
//             useFactory: (brandsFactory: CoffeeBrandsFactory) => brandsFactory.create(),
//             inject: [CoffeeBrandsFactory]
//         }
//     ],
//     exports: [CoffeesService],
// })
// export class CoffeesModule { }
