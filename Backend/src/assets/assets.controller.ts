import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AssignAssetDto } from './dto/assign-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // Admin creates a new asset in inventory
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  // IT Agent + Admin can view all assets
  @UseGuards(RolesGuard)
  @Roles(Role.IT_AGENT, Role.ADMIN)
  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  // IT Agent + Admin can view available assets
  @UseGuards(RolesGuard)
  @Roles(Role.IT_AGENT, Role.ADMIN)
  @Get('available')
  findAvailable() {
    return this.assetsService.findAvailable();
  }

  // IT Agent + Admin can view a single asset
  @UseGuards(RolesGuard)
  @Roles(Role.IT_AGENT, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.findOne(id);
  }

  // Admin deletes an asset
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.remove(id);
  }

  // IT Agent + Admin assigns an asset to a user
  @UseGuards(RolesGuard)
  @Roles(Role.IT_AGENT, Role.ADMIN)
  @Patch(':id/assign')
  assignAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignAssetDto: AssignAssetDto,
  ) {
    return this.assetsService.assignAsset(id, assignAssetDto.userId);
  }

  // IT Agent + Admin unassigns an asset (returns to AVAILABLE)
  @UseGuards(RolesGuard)
  @Roles(Role.IT_AGENT, Role.ADMIN)
  @Patch(':id/unassign')
  unassignAsset(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.unassignAsset(id);
  }

  // Get assets assigned to a specific user
  @UseGuards(RolesGuard)
  @Roles(Role.IT_AGENT, Role.ADMIN)
  @Get('user/:userId')
  getAssetsByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.assetsService.findAssetsByUser(userId);
  }
}