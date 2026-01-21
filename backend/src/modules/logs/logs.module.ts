import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { SupabaseService } from '../../shared/supabase.service';

@Module({
    controllers: [LogsController],
    providers: [LogsService, SupabaseService],
    exports: [LogsService],
})
export class LogsModule { }
