import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { MongoExceptionFilter } from './filters/mongo-exception.filter';

@Controller('user')
@UseFilters(MongoExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    console.log(id);
    const book = this.userService.findById(id);

    if (!book) {
      throw new NotFoundException('User not found');
    }

    return book;
  }

  @Post()
  createUser(
    @Body()
    user: CreateUserDto,
  ): Promise<User> {
    return this.userService.create({ ...user, role: 'user' });
  }
}
