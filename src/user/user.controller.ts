import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    console.log(id);
    const user = this.userService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
