import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PresignedUrlDto {
  @IsString() filename!: string;
  @IsOptional() @IsString() mimeType?: string;
  @IsOptional() @IsString() mime_type?: string;
}

export class ConfirmMediaDto {
  @IsString() title!: string;
  @IsString() url!: string;
  @IsOptional() @IsString() mimeType?: string;
  @IsOptional() @IsString() mime_type?: string;
  @IsOptional() @Type(() => Number) @IsInt() width?: number;
  @IsOptional() @Type(() => Number) @IsInt() height?: number;
  @IsOptional() @IsString() duration?: string;
  @IsOptional() @IsString() fileKey?: string;
}

export class MediaQueryDto {
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) per_page = 20;
}
