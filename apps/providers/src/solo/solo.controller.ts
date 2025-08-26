import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SoloService } from './solo.service';
import { CreateSoloDto } from './dto/create-solo.dto';
import { UpdateSoloDto } from './dto/update-solo.dto';

@Controller('solo')
export class SoloController {
}
