import { JwtService } from '@nestjs/jwt';
import { Controller, Get, Request, Post, UseGuards, Body, ValidationPipe, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Token, UserLoginDto, UserProfile, UserRegisterDto } from './users.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserProfile })
  @ApiUnauthorizedResponse()
  getProfile(@Request() req): Promise<UserProfile> {
    return this.usersService.getProfile(req.user.username);
  }

  @Post('register')
  @ApiCreatedResponse({ type: Token })
  @ApiBadRequestResponse()
  @ApiBody({ type: UserRegisterDto })
  async register(
    @Body(ValidationPipe) body: UserRegisterDto,
  ): Promise<Token>{
    if (body.password !== body.confirm_password) {
      throw new BadRequestException();
    }
    const userExists = await this.usersService.userExists(body.username);
    if (userExists) {
      throw new BadRequestException();
    }
    const salted_password = await this.usersService.hashPassword(body.password);
    const { password, confirm_password, ...user } = body;
    const createUserPayload = {
      ...user,
      last_ip: 'some ip',
      salted_password,
    };
    const createdUser = await this.usersService.create(createUserPayload);
    const payload = { username: createdUser.username, sub: createdUser.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  @Post('login')
  @ApiOkResponse({ type: Token })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiBody({ type: UserLoginDto })
  async login(
    @Body(ValidationPipe) body: UserLoginDto
  ): Promise<Token> {
    const existingUser = await this.usersService.findOne(body.username);
    if (!existingUser) {
      throw new UnauthorizedException();
    }
    const isValidPassword = await this.usersService.isPasswordValid(body.password, existingUser.salted_password);
    if (!isValidPassword) {
      throw new UnauthorizedException();
    }
    const payload = { username: existingUser.username, sub: existingUser.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}