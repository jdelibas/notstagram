import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import config from './config';
// import { AuthModule } from '../auth/auth.module';
import { UsersModule } from './users/users.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { PhotoModule } from './photo/photo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    Neo4jModule.forRoot(),
    // AuthModule,
    UsersModule,
    PhotoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
