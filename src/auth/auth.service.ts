import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // пользователь по username
    let user = await this.usersService.findByUsername(username);

    // по username нет, ищем по email
    if (!user) {
      user = await this.usersService.findByEmail(username);
    }

    if (!user) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    // проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    // пользователь без пароля
    const { password: _, ...result } = user;
    return result;
  }

  async signup(createUserDto: CreateUserDto): Promise<any> {
    // существует ли пользователь с таким email
    const existingUserByEmail = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // существует ли пользователь с таким username
    const existingUserByUsername = await this.usersService.findByUsername(
      createUserDto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    // хешируем пароль
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // создание пользователя
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // генерация JWT токена
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    // возвращаем пользователя и токен
    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      token,
    };
  }

  async signin(user: any): Promise<any> {
    // генерация JWT токена
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    // возвращаем пользователя и токен
    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      token,
    };
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
