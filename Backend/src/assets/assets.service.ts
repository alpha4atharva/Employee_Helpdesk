import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
  ) {}

  create(createAssetDto: CreateAssetDto) {
    const asset = this.assetRepository.create(createAssetDto);
    return this.assetRepository.save(asset);
  }

  findAll() {
    return this.assetRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: number) {
    const asset = await this.assetRepository.findOneBy({ id });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async remove(id: number) {
    const asset = await this.findOne(id);
    return this.assetRepository.remove(asset);
  }

  async assignAsset(assetId: number, userId: number) {
    const asset = await this.findOne(assetId);
    asset.assigned_to = userId;
    asset.status = 'ASSIGNED';
    return this.assetRepository.save(asset);
  }

  async unassignAsset(assetId: number) {
    const asset = await this.findOne(assetId);
    asset.assigned_to = null as any;
    asset.status = 'AVAILABLE';
    return this.assetRepository.save(asset);
  }

  async findAvailable() {
    return this.assetRepository.find({
      where: { status: 'AVAILABLE' },
      order: { name: 'ASC' },
    });
  }

  async findAssetsByUser(userId: number) {
    return this.assetRepository.find({
      where: { assigned_to: userId },
    });
  }
}