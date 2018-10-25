import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicPubsService {
  private morePubsSubject = new BehaviorSubject<boolean>(false);
  morePubs$: Observable<boolean> = this.morePubsSubject.asObservable();

  constructor() { }

  public askForMorePubs() {
    this.morePubsSubject.next(true);
  }
}
