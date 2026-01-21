import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { LogsModule } from '../logs/logs.module';
import { N8nModule } from '../n8n/n8n.module';

@Module({
    imports: [LogsModule, N8nModule],
    controllers: [MessagesController],
    providers: [MessagesService],
})
export class MessagesModule { }
