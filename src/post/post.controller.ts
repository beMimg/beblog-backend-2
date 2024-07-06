import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostSchema } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { userRoles } from 'src/user/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MulterError } from 'multer';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getAllPosts(): Promise<PostSchema[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  async getPost(@Param('id') id: string): Promise<PostSchema> {
    const post = this.postService.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(userRoles.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 2, // 2mb limit
      },
    }),
  )
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const uploadImageToCloud = await this.cloudinaryService.uploadFile(file);

    return this.postService.create(
      createPostDto,
      req.user,
      uploadImageToCloud?.url,
    );
  }
}
