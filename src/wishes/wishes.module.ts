import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { Wish } from './entities/wish.entity';
import { UsersModule } from '../users/users.module';
import { OffersModule } from '../offers/offers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wish]),
    forwardRef(() => UsersModule),
    forwardRef(() => OffersModule),
  ],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [WishesService, TypeOrmModule],
})
export class WishesModule {}
