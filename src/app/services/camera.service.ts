import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private snapShotSubject = new BehaviorSubject<any>(null);
  snapShot$: Observable<any> = this.snapShotSubject.asObservable();

  constructor() { }

  //SEND SNAPSHOT LISTENER:
  public notifySnapShot(snapshot: any) {
    this.snapShotSubject.next(snapshot);
  }
}
