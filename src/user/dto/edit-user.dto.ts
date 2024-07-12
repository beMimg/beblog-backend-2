import {
  IsNotEmpty,
  IsOptional,
  isString,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  bio: string;
}
