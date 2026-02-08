import { IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
