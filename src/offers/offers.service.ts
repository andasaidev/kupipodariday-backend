import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    const wish = await this.wishesRepository.findOne({
      where: { id: createOfferDto.itemId },
      relations: ['owner'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('Нельзя скидываться на свой подарок');
    }

    const newRaised = Number(wish.raised) + Number(createOfferDto.amount);

    if (newRaised > wish.price) {
      throw new BadRequestException(
        'Сумма собранных средств не может превышать стоимость подарка',
      );
    }

    const offer = this.offersRepository.create({
      amount: createOfferDto.amount,
      hidden: createOfferDto.hidden || false,
      user,
      item: wish,
    });

    wish.raised = newRaised;
    await this.wishesRepository.save(wish);

    return this.offersRepository.save(offer);
  }

  async findAll(): Promise<Offer[]> {
    return this.offersRepository.find({
      relations: ['user', 'item', 'item.owner'],
    });
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: ['user', 'item', 'item.owner'],
    });

    if (!offer) {
      throw new NotFoundException('Заявка не найдена');
    }

    return offer;
  }
}
