import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return ['user1', 'user2'];
  }
}

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [],
})
export class AppModule {}