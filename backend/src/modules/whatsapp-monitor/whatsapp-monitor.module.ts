import { Module } from '@nestjs/common';
import { WhatsAppMonitorGateway } from './whatsapp-monitor.gateway';
import { WhatsAppMonitorController } from './whatsapp-monitor.controller';

@Module({
    controllers: [WhatsAppMonitorController],
    providers: [WhatsAppMonitorGateway],
    exports: [WhatsAppMonitorGateway],
})
export class WhatsAppMonitorModule { }
