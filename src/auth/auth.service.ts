import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ token: string }> {
    const { username, email, password, role } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const token = this.jwtService.sign({ id: newUser._id });

    return { token };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { username, password } = loginDto;

    const foundUser = await this.userModel.findOne({ username });

    if (!foundUser) {
      throw new UnauthorizedException('Invalid username');
    }

    const passwordMatch = await bcrypt.compare(password, foundUser.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.jwtService.sign({ id: foundUser._id });

    return { token };
  }
}
