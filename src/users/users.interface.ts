import { ApiProperty } from '@nestjs/swagger';
import {IsString, IsEmail, IsOptional } from 'class-validator';

export type User = {
  user_id: string
  email: string
  username: string
  salted_password: string
  first_name?: string
  last_name?: string
  last_ip: string
  date_created: string
  date_updated: string
}

export class UserProfile {
  @IsString()
  @ApiProperty({ type: String })
  user_id: string;
  @IsString()
  @IsEmail()
  @ApiProperty({ type: String })
  email: string;
  @IsString()
  @ApiProperty({ type: String })
  username: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  first_name?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  last_name?: string;
  @IsString()
  @ApiProperty({ type: String })
  last_ip: string;
  @IsString()
  @ApiProperty({ type: String })
  date_created: string;
  @IsString()
  @ApiProperty({ type: String })
  date_updated: string;
}

export class UserLoginDto {
  @IsString()
  @ApiProperty({ type: String })
  username: string
  @IsString()
  @ApiProperty({ type: String })
  password: string
}

export class UserRegisterDto {
  @IsString()
  @ApiProperty({ type: String })
  username: string;
  @IsString()
  @ApiProperty({ type: String })
  password: string
  @IsString()
  @ApiProperty({ type: String })
  confirm_password: string
  @IsString()
  @IsEmail()
  @ApiProperty({ type: String })
  email: string
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  first_name?: string
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  last_name?: string
}

export type UserUpdateDto = {
  first_name?: string
  last_name?: string
}

export type UserCreatePayload = {
  username: string
  salted_password: string
  email: string
  last_ip: string
  first_name?: string
  last_name?: string
}

export class Token {
  @IsString()
  @ApiProperty({ type: String, description: 'JWT access token' })
  access_token: string;
}