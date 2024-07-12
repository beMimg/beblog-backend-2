import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return await this.userModel.findById(id, '-password').exec();
  }

  async edit(
    editUserDto: EditUserDto,
    id: string,
    imageUrl?: string,
  ): Promise<any> {
    return await this.userModel
      .findByIdAndUpdate(
        id,
        {
          bio: editUserDto.bio,
          imageUrl: imageUrl,
        },
        { new: true }, // returns the new document
      )
      .exec();
  }
}
