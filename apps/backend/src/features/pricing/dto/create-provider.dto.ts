import { IsString, IsUrl, IsOptional, MinLength } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsUrl({}, { message: 'websiteUrl must be a valid URL' })
  websiteUrl?: string;
}
