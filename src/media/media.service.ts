import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Repository } from 'typeorm';
import { Media } from '../database/entities';
import { ConfirmMediaDto, PresignedUrlDto } from './media.dto';

@Injectable()
export class MediaService {
  private readonly s3: S3Client;

  constructor(
    @InjectRepository(Media) private readonly media: Repository<Media>,
    private readonly config: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: config.get('S3_REGION', 'auto'),
      endpoint: config.get('S3_ENDPOINT'),
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get('S3_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async presign(dto: PresignedUrlDto) {
    if (!/^[a-zA-Z0-9._ -]+$/.test(dto.filename)) throw new BadRequestException('Invalid filename');
    const mime = dto.mimeType || dto.mime_type || 'application/octet-stream';
    const fileKey = `uploads/${Date.now()}-${crypto.randomUUID()}-${dto.filename}`;
    const uploadUrl = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.config.getOrThrow('S3_BUCKET'),
        Key: fileKey,
        ContentType: mime,
      }),
      { expiresIn: 300 },
    );
    const publicUrl = `${this.config.getOrThrow('MEDIA_PUBLIC_URL').replace(/\/$/, '')}/${fileKey}`;
    return { uploadUrl, fileKey, publicUrl };
  }

  async confirm(dto: ConfirmMediaDto) {
    const mime = dto.mimeType || dto.mime_type || 'image/png';
    const item = this.media.create({
      title: dto.title,
      url: dto.url,
      mimeType: mime,
      width: dto.width,
      height: dto.height,
      duration: dto.duration,
      fileKey: dto.fileKey,
    });
    const saved = await this.media.save(item);
    return {
      ...saved,
      mime_type: saved.mimeType,
    };
  }

  async list(type: string, page: number, perPage: number) {
    const prefix = type === 'images' ? 'image/' : type === 'videos' ? 'video/' : type === 'audio' ? 'audio/' : null;
    if (!prefix) throw new BadRequestException('type must be images, videos, or audio');

    const [mediaItems, total] = await this.media
      .createQueryBuilder('media')
      .where('media.mime_type LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('media.created_at', 'DESC')
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    const formattedMedia = mediaItems.map((item) => ({
      ...item,
      mime_type: item.mimeType,
    }));

    return {
      total_pages: Math.ceil(total / perPage),
      media: formattedMedia,
    };
  }
}
