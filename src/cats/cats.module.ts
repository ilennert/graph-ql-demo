
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { CatRepoService, TableManagementService } from './services';
import { CatsController } from './cats.controller';
import { CatsResolvers } from './cats.resolvers';
import { join } from 'path';

@Module({
    imports: [
        GraphQLModule.forRoot({
            typePaths: ['**/*/*.graphql']
            // installSubscriptionHandlers: true
            // definitions: { path: join(process.cwd(), 'src/cats/graphql.schema.ts') }
        })
    ],
    providers: [ TableManagementService, CatRepoService, CatsResolvers ],
    exports: [ CatRepoService, TableManagementService ],
    controllers: [ CatsController ]
})
export class CatsModule {}
