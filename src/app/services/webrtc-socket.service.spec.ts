import { TestBed, inject } from '@angular/core/testing';

import { WebrtcSocketService } from './webrtc-socket.service';

describe('WebrtcSocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebrtcSocketService]
    });
  });

  it('should be created', inject([WebrtcSocketService], (service: WebrtcSocketService) => {
    expect(service).toBeTruthy();
  }));
});
