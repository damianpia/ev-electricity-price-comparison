import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ok backend health payload', () => {
    const service = new HealthService();

    const result = service.getHealthStatus();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('backend');
    expect(typeof result.timestamp).toBe('string');
  });
});
