import { Controller, Get } from '@nestjs/common';
@Controller('health')
export class HealthController {
 @Get() status(){return {status:'ok',service:'inpos-api',version:'0.1.0',timestamp:new Date().toISOString()};}
}
