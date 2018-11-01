import { TestBed, inject } from '@angular/core/testing';

import { UserOperationService } from './user-operation.service';

describe('UserOperationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserOperationService]
    });
  });

  it('should be created', inject([UserOperationService], (service: UserOperationService) => {
    expect(service).toBeTruthy();
  }));
});
