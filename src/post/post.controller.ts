import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
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
import {
  ACCEPTED_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from './constants/contants';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getAllPosts(
    @Query('limit') limit: number = 3,
    @Query('skip') skip: number = 0,
  ): Promise<PostSchema[]> {
    return this.postService.findAll(limit, skip);
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
        fileSize: ACCEPTED_IMAGE_SIZE, // 2mb limit
      },
      fileFilter(req, file, callback) {
        if (ACCEPTED_IMAGE_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type'), false);
        }
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

  @Post('/:id/like')
  @UseGuards(AuthGuard())
  async likePost(@Req() req, @Param('id') id: string): Promise<any> {
    return this.postService.like(req.user._id, id);
  }

  @Delete('/:id/like')
  @UseGuards(AuthGuard())
  async deslikePost(@Req() req, @Param('id') id: string): Promise<any> {
    return this.postService.deslike(req.user._id, id);
  }
}
