import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    // Находим подарки по IDs
    const wishes = await this.wishesRepository.findByIds(
      createWishlistDto.itemsId,
    );

    const wishlist = this.wishlistsRepository.create({
      name: createWishlistDto.name,
      description: createWishlistDto.description,
      image: createWishlistDto.image,
      owner: { id: userId } as User,
      items: wishes,
    });

    return this.wishlistsRepository.save(wishlist);
  }

  async findAll(): Promise<Wishlist[]> {
    return this.wishlistsRepository.find({
      relations: ['owner', 'items'],
    });
  }

  async findById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Подборка не найдена');
    }

    return wishlist;
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!wishlist) {
      throw new NotFoundException('Подборка не найдена');
    }

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужую подборку');
    }

    // Если обновляем items, находим новые подарки
    if (updateWishlistDto.itemsId) {
      const wishes = await this.wishesRepository.findByIds(
        updateWishlistDto.itemsId,
      );
      wishlist.items = wishes;
    }

    Object.assign(wishlist, updateWishlistDto);
    return this.wishlistsRepository.save(wishlist);
  }

  async remove(id: number, userId: number): Promise<void> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужую подборку');
    }

    await this.wishlistsRepository.delete(id);
  }
}
