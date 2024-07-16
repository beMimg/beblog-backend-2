import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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
    return await this.commentModel
      .find({ post: post_id })
      .populate({ path: 'author', select: 'imageUrl username' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Comment> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    return this.commentModel.findById(id).exec();
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

  async edit(
    createCommentDto: CreateCommentDto,
    user: User,
    comment_id: string,
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const comment = await this.findById(comment_id);

    if (!comment) {
      throw new BadRequestException("This comments doens't exists");
    }

    if (comment.author.toString() != user._id.toString()) {
      throw new ForbiddenException("You're not the author of this post.");
    }

    comment.text = createCommentDto.text;

    await comment.save();

    return comment;
  }

  async delete(user: User, comment_id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const comment = await this.findById(comment_id);

    if (!comment) {
      throw new BadRequestException("This comments doens't exists");
    }

    if (comment.author.toString() != user._id.toString()) {
      throw new ForbiddenException("You're not the author of this post");
    }

    await comment.deleteOne();

    return { deletedComment: comment };
  }
}
