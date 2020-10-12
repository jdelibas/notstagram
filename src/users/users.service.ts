import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { Record } from 'neo4j-driver';
import { hash, compare } from 'bcrypt';
import { User, UserCreatePayload, UserProfile } from './users.interface';

@Injectable()
export class UsersService {
  private saltRounds: number;

  constructor(
    private readonly neo4jService: Neo4jService,
  ) {
    this.saltRounds = 15;
  }

  mapRecordToUser(record: Record): User {
    const { user: { properties } }:any = record.toObject();
    return {
      user_id: properties.user_id,
      email: properties.email,
      username: properties.username,
      salted_password: properties.salted_password,
      first_name: properties.first_name || '',
      last_name: properties.last_name || '',
      last_ip:properties.last_ip,
      date_created: properties.date_created,
      date_updated: properties.date_updated,
    };
  }

  async getProfile(username: string): Promise<UserProfile>{
    const { salted_password, ...user } = await this.findOne(username);
    return user;
  }

  async findOne(username: string): Promise<User | undefined> {
    const { records } = await this.neo4jService.read(`
      MATCH (user:User { username: $username }) RETURN user
      LIMIT 1
    `, {
      username,
    });
    if (!records[0]) {
      return undefined;
    }
    return this.mapRecordToUser(records[0]);
  }

  async userExists(username: string): Promise<Boolean> {
    const existingUser = await this.findOne(username);
    console.log(existingUser);
    if (existingUser) {
      return true;
    }
    return false;
  }

  async create(user: UserCreatePayload): Promise<User> {
    const { records } = await this.neo4jService.write(`
      CREATE (user:User {user_id: $id, username: $username, salted_password: $salted_password, email: $email, first_name: $first_name, last_name: $last_name, date_created: $date_created, date_updated: $date_updated})
      RETURN user
    `, {
      id: uuidv4(),
      date_created: new Date().toISOString(),
      date_updated: new Date().toISOString(),
      first_name: '',
      last_name: '',
      ...user,
    });
    if (!records || !records[0]) {
      throw new Error('Failed to create user')
    }
    return this.mapRecordToUser(records[0]);
  }

  async isPasswordValid(password: string, hash: string): Promise<Boolean> {
    return compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.saltRounds);
  }
}