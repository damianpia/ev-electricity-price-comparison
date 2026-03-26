import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { TaskStatusService } from './task-status.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly taskStatusService: TaskStatusService,
  ) {}

  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  @Post()
  async update(@Body() settings: UpdateSettingsDto) {
    await this.settingsService.updateBulk(settings as any);
    return { message: 'Settings updated successfully' };
  }

  @Get('status')
  getStatus() {
    return this.taskStatusService.getStatus();
  }

  @Post('recalculate')
  async recalculate() {
    await this.settingsService.recalculateAllSessions();
    return { message: 'Recalculation started in background' };
  }
}
