import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser('idUsuario') idUsuario: number) {
    return this.usersService.getProfile(idUsuario);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('idUsuario') idUsuario: number,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(idUsuario, updateDto);
  }

  @Patch('password')
  async changePassword(
    @CurrentUser('idUsuario') idUsuario: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(idUsuario, changePasswordDto);
  }
}
