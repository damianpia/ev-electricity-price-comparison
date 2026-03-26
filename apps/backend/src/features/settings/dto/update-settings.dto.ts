import { IsString, IsNumber, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @IsString()
  @IsNotEmpty()
  TESLAMATE_HOME_GEOFENCE_NAME: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  MIN_CHARGING_SESSION_KWH: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  DEFAULT_FIXED_ENERGY_PRICE: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  DEFAULT_TRANSMISSION_FEE: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  DEFAULT_PROVIDER_MARGIN: number;
}
