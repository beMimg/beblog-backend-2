import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/user/schemas/user.schema';
import { Comment } from './schemas/comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async findAllCommentsInPost(post_id: string): Promise<Comment[]> {
    if (!mongoose.Types.ObjectId.isValid(post_id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return await this.commentModel.find({ post: post_id });
  }

  async findById(id: string): Promise<Comment> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    return await this.commentModel.findById(id).exec();
  }

  async create(
    createCommentDto: CreateCommentDto,
    user: User,
    post_id: string,
  ): Promise<Comment> {
    if (!mongoose.Types.ObjectId.isValid(post_id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const comment = Object.assign(createCommentDto, {
      author: user._id,
      post: post_id,
    });

    const res = await this.commentModel.create(comment);

    return res;
  }
}
