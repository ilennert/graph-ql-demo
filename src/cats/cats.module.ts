
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { AddressRepoService } from './services/address-repo.service';
import { TableManagementService } from './services/table-management.service';
import { OwnerRangeRepoService } from './services/cat-owner-range-repo.service';
import { OwnerRepoService } from './services/owner-repo.service';
import { PersonAddressRepoService } from './services/person-address-repo.service';
import { SanctuaryRepoService } from './services/sanctuary-repo.service';
import { CatRepoService } from './services/cats-repo.service';
import { CatsController } from './cats.controller';
import { CatsResolvers } from './cats.resolvers';
import { MappingService } from './helpers/mapping.service';

@Module({
    imports: [
        GraphQLModule.forRoot({
            typePaths: ['**/*/*.graphql']
            // installSubscriptionHandlers: true
            // definitions: { path: join(process.cwd(), 'src/cats/graphql.schema.ts') }
        })
    ],
    providers: [
        CatRepoService,
        TableManagementService,
        CatsResolvers,
        MappingService,
        OwnerRepoService,
        OwnerRangeRepoService,
        PersonAddressRepoService,
        SanctuaryRepoService,
        AddressRepoService ],
    exports: [
        CatRepoService,
        TableManagementService ],
    controllers: [ CatsController ]
})
export class CatsModule {}
