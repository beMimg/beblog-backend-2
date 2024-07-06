import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum userRoles {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: userRoles, default: userRoles.USER })
  role: userRoles;
}

export const UserSchema = SchemaFactory.createForClass(User);
