import { Test, TestingModule } from '@nestjs/testing';
import { Sqlite3Service } from './sqlite3.service';

describe('Sqlite3Service', () => {
  let service: Sqlite3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Sqlite3Service],
    }).compile();

    service = module.get<Sqlite3Service>(Sqlite3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
