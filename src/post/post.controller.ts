import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostSchema } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

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
  @UseGuards(AuthGuard())
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
  ): Promise<any> {
    return this.postService.create(createPostDto, req.user);
  }
}
