import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type SchemaDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  topic: string;

  @Prop()
  image: string;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  likes: [Types.ObjectId];
}

export const PostSchema = SchemaFactory.createForClass(Post);
