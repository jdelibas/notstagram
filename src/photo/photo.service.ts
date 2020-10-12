import { Injectable } from '@nestjs/common';
import { Record } from 'neo4j-driver';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import { Photo, PhotoCreateDto } from './photo.interface';

@Injectable()
export class PhotoService {

  constructor(
    private readonly neo4jService: Neo4jService,
  ) {}

  mapRecordToPhoto(record: Record): Photo {
    const { photo: { properties } }:any = record.toObject();
    return {
      photo_id: properties.photo_id,
      user_id: properties.user_id,
      caption: properties.caption,
      latitude: properties.latitude || '',
      longitude: properties.longitude || '',
      image_path: properties.image_path,
      image_size: properties.image_size,
      date_created: properties.date_created,
      date_updated: properties.date_updated,
    };
  }

  async findOne(photo_id: string): Promise<Photo | undefined> {
    const { records } = await this.neo4jService.read(`
      MATCH (photo:Photo { photo_id: $photo_id })
      RETURN photo
      LIMIT 1
    `, {
      photo_id,
    });
    if (!records[0]) {
      return undefined;
    }
    return this.mapRecordToPhoto(records[0]);
  }

  async countLikes(photo_id: string): Promise<number | undefined> {
    const { records } = await this.neo4jService.read(`
      MATCH ()-[r:LIKES]->(p:Photo { photo_id: $photo_id })
      RETURN COUNT(r) AS count
    `, {
      photo_id,
    });
    if (!records[0]) {
      return undefined;
    }
    const count = records[0].get('count');
    return count.toNumber();
  }

  async getUserPhotos(username: string): Promise<Photo[] | undefined[]> {
    const { records } = await this.neo4jService.read(`
      MATCH (:User { username: $username })-[r:PHOTO]-(photo:Photo)
      RETURN photo
      ORDER BY photo.date_created DESC
    `, {
      username,
    });
    if (!records[0]) {
      return [];
    }
    return records.map(r => this.mapRecordToPhoto(r));
  }

  async likePhoto(user_id: string, photo_id: string): Promise<Photo | undefined> {
    const { records } = await this.neo4jService.write(`
      MATCH (u:User), (p:Photo)
      WHERE u.user_id = $user_id AND p.photo_id = $photo_id
      MERGE (u)-[r:LIKES]->(p)
      ON MATCH SET r.toDelete = true
      WITH r
      WHERE r.toDelete
      DELETE r
    `, {
      user_id,
      photo_id,
      date_created: new Date().toISOString(),
    });
    if (!records[0]) {
      return undefined;
    }
    return this.mapRecordToPhoto(records[0]);
  }

  async create(photoCreate: PhotoCreateDto): Promise<Photo> {
    const { records } = await this.neo4jService.write(`
      MATCH (user:User)
      WHERE user.user_id = $user_id
      CREATE (user)-[r:PHOTO]->(photo:Photo {photo_id: $photo_id, user_id: $user_id, caption: $caption, latitude: $latitude, longitude: $longitude, image_path: $image_path, image_size: $image_size, date_created: $date_created, date_updated: $date_updated})
      RETURN photo
    `, {
      photo_id: uuidv4(),
      date_created: new Date().toISOString(),
      date_updated: new Date().toISOString(),
      ...photoCreate,
    });
    if (!records || !records[0]) {
      throw new Error('Failed to create photo')
    }
    return this.mapRecordToPhoto(records[0]);
  }
}