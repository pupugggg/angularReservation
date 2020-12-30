import { TestBed } from '@angular/core/testing';

import { InMemoryBackendService } from './in-memory-backend.service';

describe('InMemoryBackendService', () => {
  let service: InMemoryBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemoryBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
