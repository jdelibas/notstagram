import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class Photo {
  @IsString()
  @ApiProperty({ type: String })
  photo_id: string
  @IsString()
  @ApiProperty({ type: String })
  user_id:string
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  caption?: string
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  latitude?: number
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  longitude?: number
  @IsString()
  @ApiProperty({ type: String })
  image_path: string
  @IsString()
  @ApiProperty({ type: String })
  image_size: string
  @IsString()
  @ApiProperty({ type: String })
  date_created: string
  @IsString()
  @ApiProperty({ type: String })
  date_updated: string
}

export class PhotoCreateDto {
  @IsString()
  @ApiProperty({ type: String })
  user_id:string
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  caption?: string
  @IsString()
  @IsOptional()
  @ApiProperty({ type: Number })
  latitude?: number
  @IsString()
  @IsOptional()
  @ApiProperty({ type: Number })
  longitude?: number
}