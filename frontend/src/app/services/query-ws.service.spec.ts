import { TestBed, inject } from '@angular/core/testing';

import { QueryWSService } from './query-ws.service';

describe('QueryWSService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QueryWSService]
    });
  });

  it('should be created', inject([QueryWSService], (service: QueryWSService) => {
    expect(service).toBeTruthy();
  }));
});
