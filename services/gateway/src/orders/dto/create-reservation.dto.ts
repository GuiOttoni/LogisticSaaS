import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty() @IsString() sku_id: string;
  @ApiProperty() @IsUUID() order_id: string;
}
