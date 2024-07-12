import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import {
  ACCEPTED_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from 'src/post/constants/contants';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('self')
  @UseGuards(AuthGuard())
  async getSelf(@Req() req): Promise<User> {
    return this.userService.findById(req.user._id);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  async getUser(@Param('id') id: string): Promise<User> {
    const user = this.userService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Put()
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: ACCEPTED_IMAGE_SIZE, // 2mb limit
      },
      fileFilter(req, file, callback) {
        if (file) {
          if (ACCEPTED_IMAGE_TYPES.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(new Error('Invalid file type'), false);
          }
        } else {
          callback(null, true);
        }
      },
    }),
  )
  async editProfile(
    @Body() editUserDto: EditUserDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    let uploadImageToCloud: any;

    if (file) {
      uploadImageToCloud = await this.cloudinaryService.uploadFile(file);
    }

    return this.userService.edit(
      editUserDto,
      req.user,
      uploadImageToCloud?.url,
    );
  }
}
