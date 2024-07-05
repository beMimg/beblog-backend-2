import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MongoExceptionFilter } from './filters/mongo-exception.filter';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@UseFilters(MongoExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  createUser(
    @Body()
    createUserDto: CreateUserDto,
  ): Promise<{ token: string }> {
    return this.authService.create({ ...createUserDto, role: 'user' });
  }

  @Post('signin')
  login(
    @Body()
    loginDto: LoginDto,
  ): Promise<any> {
    return this.authService.login(loginDto);
  }
}
