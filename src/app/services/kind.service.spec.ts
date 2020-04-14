import { TestBed } from '@angular/core/testing';

import { KindService } from './kind.service';

describe('KindService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KindService = TestBed.get(KindService);
    expect(service).toBeTruthy();
  });
});
