import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'EV Electricity Price Comparison API is running!';
  }
}
