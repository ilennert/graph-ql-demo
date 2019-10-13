import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PetsModule } from './pets/pets.module';
import { AppService } from './app.service';

@Module({
  imports: [
    PetsModule
  ],
  controllers: [ AppController ],
  providers: [ AppService ]
})
export class AppModule {}
