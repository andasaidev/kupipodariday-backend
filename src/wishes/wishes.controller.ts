import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('last')
  async findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  async findTop() {
    return this.wishesService.findTop();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.create(createWishDto, req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.wishesService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Request() req,
  ) {
    return this.wishesService.update(+id, updateWishDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.wishesService.remove(+id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copy(@Param('id') id: string, @Request() req) {
    return this.wishesService.copy(+id, req.user.userId);
  }
}
