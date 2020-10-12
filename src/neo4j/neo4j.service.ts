import neo4j, { Result } from 'neo4j-driver';
import { Inject, Injectable } from '@nestjs/common';
import { Driver } from 'neo4j-driver';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';
import { Neo4jConfig, Neo4jModule } from './neo4j.module';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Neo4jService {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(NEO4J_DRIVER) private readonly driver: Driver,
  ) {}

  getDriver(): Driver {
    return this.driver;
  }

  getConfig(): Neo4jConfig {
    return {
      scheme: this.config.get('NEO_DATABASE_SCHEME'),
      host: this.config.get('NEO_DATABASE_HOST'),
      port: this.config.get('NEO_DATABASE_PORT'),
      username: this.config.get('NEO_DATABASE_USERNAME'),
      password: this.config.get('NEO_DATABASE_PASSWORD'),
      database: this.config.get('NEO_DATABASE_DATABASE') || '',
    }
  }

  getReadSession(database?: string) {
    const config = this.getConfig();
    return this.driver.session({
      database: database || config.database,
      defaultAccessMode: neo4j.session.READ,
    });
  }

  getWriteSession(database?: string) {
    const config = this.getConfig();
    return this.driver.session({
      database: database || config.database,
      defaultAccessMode: neo4j.session.WRITE,
    });
  }

  read(cypher: string, params: Record<string, any>, database?: string): Result {
    const session = this.getReadSession(database);
    return session.run(cypher, params);
  }

  write(cypher: string, params: Record<string, any>, database?: string): Result {
    const session = this.getWriteSession(database);
    return session.run(cypher, params);
  }

}
