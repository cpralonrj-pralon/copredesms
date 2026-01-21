import { Controller, Get, Post, Body, Patch, Param, ParseBoolPipe, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../../common/decorators';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll(@TenantId() tenantId: string) {
        return this.usersService.findAll(tenantId);
    }

    @Post('register')
    async register(@Body() registerUserDto: any, @TenantId() tenantId: string, @Req() req: any) {
        let adminTenantId = tenantId;

        // Fallback: If decorator failed (empty JWT metadata), fetch from DB
        if (!adminTenantId) {
            console.log('⚠️ [UsersController] TenantID missing in JWT, fetching from DB...');
            try {
                adminTenantId = await this.usersService.getTenantId(req.user.id);
            } catch (error) {
                console.error('❌ Falha ao buscar TenantID:', error.message);
                throw error;
            }
        }

        return this.usersService.register(registerUserDto, adminTenantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.usersService.findOne(id, tenantId);
    }

    @Patch(':id/active')
    toggleActive(
        @Param('id') id: string,
        @Body('ativo', ParseBoolPipe) ativo: boolean,
        @TenantId() tenantId: string,
    ) {
        return this.usersService.toggleActive(id, ativo, tenantId);
    }
}
