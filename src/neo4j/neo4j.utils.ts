import { ConfigService } from "@nestjs/config";
import neo4j, { Driver } from "neo4j-driver";
import { Neo4jConfig } from "./neo4j.module";

export const createDriver = async (config: ConfigService) => {
  console.log(`${config.get('NEO_DATABASE_SCHEME')}://${config.get('NEO_DATABASE_HOST')}:${config.get('NEO_DATABASE_PORT')}`)
  const driver: Driver = neo4j.driver(
    `${config.get('NEO_DATABASE_SCHEME')}://${config.get('NEO_DATABASE_HOST')}:${config.get('NEO_DATABASE_PORT')}`,
    neo4j.auth.basic(config.get('NEO_DATABASE_USERNAME'), config.get('NEO_DATABASE_PASSWORD')),
  );

  await driver.verifyConnectivity();

  return driver;
};