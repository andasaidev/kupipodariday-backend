import { IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  itemId: number;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
