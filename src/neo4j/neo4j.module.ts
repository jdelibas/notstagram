import { DynamicModule, Global, Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';
import { createDriver } from './neo4j.utils';
import { ConfigService } from '@nestjs/config';

export interface Neo4jConfig {
  scheme: string;
  host: string;
  port: number | string;
  username: string;
  password: string;
  database?: string;
}

@Global()
@Module({})
export class Neo4jModule {

  constructor(private configService: ConfigService){}

  static forRoot(): DynamicModule {
    return {
      module: Neo4jModule,
      providers: [
        Neo4jService, {
          provide: NEO4J_DRIVER,
          inject: [ ConfigService ],
          useFactory: async (config: ConfigService) => createDriver(config),
        }
      ],
      exports: [
        Neo4jService,
      ]
    }
  }

}
