import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UploadLocationImagesDto } from './dto/upload-location-images.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto, createLocationDto.userId);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }

  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
    }),
  )
  uploadImages(
    @Param('id') id: string, 
    @Body() uploadLocationImagesDto: UploadLocationImagesDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }
    if (files.length !== uploadLocationImagesDto.imageTypes.length) {
      throw new BadRequestException('Number of files must match number of image types');
    }
    return this.locationService.uploadImages(+id, uploadLocationImagesDto, files, id);
  }

  @Get(':id/images')
  getImages(@Param('id') id: string) {
    return this.locationService.getImages(+id);
  }
}
