
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { AddressRepoService } from './services/address-repo.service';
import { TableManagementService } from './services/table-management.service';
import { OwnerRangeRepoService } from './services/pet-owner-range-repo.service';
import { OwnerRepoService } from './services/owner-repo.service';
import { PersonAddressRepoService } from './services/person-address-repo.service';
import { SanctuaryRepoService } from './services/sanctuary-repo.service';
import { PetRepoService } from './services/pets-repo.service';
import { SpeciesRepoService } from './services/species-repo.service';
import { PetsController } from './pets.controller';
import { PetsResolvers } from './pets.resolvers';
import { MappingService } from './helpers/mapping.service';

@Module({
    imports: [
        GraphQLModule.forRoot({
            typePaths: ['**/*/*.graphql']
            // installSubscriptionHandlers: true
            // definitions: { path: join(process.cwd(), 'src/pets/graphql.schema.ts') }
        })
    ],
    providers: [
        PetRepoService,
        TableManagementService,
        PetsResolvers,
        MappingService,
        OwnerRepoService,
        OwnerRangeRepoService,
        PersonAddressRepoService,
        SanctuaryRepoService,
        SpeciesRepoService,
        AddressRepoService ],
    exports: [
        PetRepoService,
        TableManagementService ],
    controllers: [ PetsController ]
})
export class PetsModule {}
