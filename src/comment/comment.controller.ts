import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/post/:post_id')
  @UseGuards(AuthGuard())
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
    @Param('post_id') post_id: string,
  ): Promise<any> {
    console.log(post_id);
    return this.commentService.create(createCommentDto, req.user, post_id);
  }
}
