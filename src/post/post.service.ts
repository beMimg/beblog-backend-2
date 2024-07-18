import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import mongoose, { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async findAll(limit: number, skip: number): Promise<Post[]> {
    const posts = await this.postModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate({ path: 'author', select: 'imageUrl username' })
      .exec();
    return posts;
  }

  async findById(id: string): Promise<Post> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    return await this.postModel
      .findById(id)
      .populate({ path: 'author', select: 'imageUrl username' })
      .exec();
  }

  async create(
    createPostDto: CreatePostDto,
    user: User,
    image?: string,
  ): Promise<any> {
    const data = Object.assign(createPostDto, {
      author: user._id,
      image: image,
    });

    const res = await this.postModel.create(data);

    return res;
  }

  async like(userId: any, postId: string): Promise<Post> {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const updatedPost = await this.postModel.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } }, // Using $addToSet to avoid duplicate likes
      { new: true }, // Return the updated document
    );

    if (!updatedPost) {
      throw new BadRequestException('Post not found');
    }

    return updatedPost;
  }

  async deslike(userId: any, postId: string): Promise<Post> {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const updatedPost = await this.postModel.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } }, // Using $addToSet to avoid duplicate likes
      { new: true }, // Return the updated document
    );

    if (!updatedPost) {
      throw new BadRequestException('Post not found');
    }

    return updatedPost;
  }
}
