import { validate } from 'class-validator';
import { CreateProviderDto } from './create-provider.dto';
import { plainToInstance } from 'class-transformer';

describe('CreateProviderDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateProviderDto, {
      name: 'PGE',
      websiteUrl: 'https://pge.pl',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid URL', async () => {
    const dto = plainToInstance(CreateProviderDto, {
      name: 'PGE',
      websiteUrl: 'not-a-url',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUrl');
  });

  it('should fail if name is too short', async () => {
    const dto = plainToInstance(CreateProviderDto, {
      name: 'P',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});
