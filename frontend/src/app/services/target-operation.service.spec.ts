import { TestBed, inject } from '@angular/core/testing';

import { TargetOperationService } from './target-operation.service';

describe('TargetOperationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TargetOperationService]
    });
  });

  it('should be created', inject([TargetOperationService], (service: TargetOperationService) => {
    expect(service).toBeTruthy();
  }));
});
