import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, owner: User): Promise<Wish> {
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner,
    });
    return this.wishesRepository.save(wish);
  }

  async findLast(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner'],
    });
  }

  async findTop(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner'],
    });
  }

  async findById(id: number): Promise<Wish> {
    return this.wishesRepository.findOne({
      where: { id },
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  async update(
    id: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой подарок');
    }

    if (wish.offers.length > 0 && updateWishDto.price) {
      throw new ForbiddenException(
        'Нельзя изменять стоимость, если уже есть желающие скинуться',
      );
    }

    Object.assign(wish, updateWishDto);
    return this.wishesRepository.save(wish);
  }

  async remove(id: number, userId: number): Promise<void> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужой подарок');
    }

    await this.wishesRepository.delete(id);
  }

  async copy(id: number, userId: number): Promise<Wish> {
    const wish = await this.findById(id);

    const copiedWish = this.wishesRepository.create({
      ...wish,
      id: undefined,
      raised: 0,
      copied: 0,
      offers: [],
      owner: { id: userId } as User,
    });

    wish.copied += 1;
    await this.wishesRepository.save(wish);

    return this.wishesRepository.save(copiedWish);
  }
}
