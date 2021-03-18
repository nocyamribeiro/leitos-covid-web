import { TestBed } from '@angular/core/testing';

import { LeitosService } from './leitos.service';

describe('LeitosService', () => {
  let service: LeitosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeitosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
