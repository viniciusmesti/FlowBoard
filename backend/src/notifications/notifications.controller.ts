import { Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationItemDto } from './dto/notification-item.dto';
import { SeedDataService } from './seed-data';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly seedDataService: SeedDataService,
  ) {}

  @Get()
  async getAll(@Query('userId') userId: string): Promise<NotificationItemDto[]> {
    console.log('📩 Notification fetch for userId:', userId);
    return this.notificationsService.getNotifications(userId);
  }

  @Get('debug')
  async debug(@Query('userId') userId: string): Promise<any> {
    console.log('Debug request for userId:', userId);
    
    // Retorna informações de debug
    return {
      userId,
      isValidUUID: this.notificationsService['isValidUUID'] ? this.notificationsService['isValidUUID'](userId) : 'Method not accessible',
      timestamp: new Date().toISOString(),
      message: 'Debug endpoint working'
    };
  }

  @Post('seed')
  async seedData(): Promise<any> {
    try {
      await this.seedDataService.createSampleData();
      return { 
        success: true, 
        message: 'Sample data created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error seeding data:', error);
      return { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
} 