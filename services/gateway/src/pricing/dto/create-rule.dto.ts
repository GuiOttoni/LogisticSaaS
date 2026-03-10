import { IsString, IsEnum, IsObject, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TargetScope {
  GLOBAL   = 'GLOBAL',
  CATEGORY = 'CATEGORY',
  SKU      = 'SKU',
  REGION   = 'REGION',
}

export class CreateRuleDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: TargetScope }) @IsEnum(TargetScope) target_scope: TargetScope;
  @ApiProperty() @IsString() @IsOptional() target_id?: string;
  @ApiProperty() @IsObject() conditions: Record<string, unknown>;
  @ApiProperty() @IsObject() action_logic: Record<string, unknown>;
  @ApiProperty() @IsInt() priority: number;
  @ApiProperty() @IsBoolean() is_active: boolean;
}
