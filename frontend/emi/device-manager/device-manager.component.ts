import { DeviceManagerService } from './device-manager.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fuseAnimations } from '../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import * as Rx from 'rxjs/Rx';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'device-manager',
  templateUrl: './device-manager.component.html',
  styleUrls: ['./device-manager.component.scss'],
  animations: fuseAnimations
})
export class DeviceManagerComponent implements OnInit, OnDestroy {
  
  helloWorld: String = 'Hello World static';
  helloWorldLabelQuery$: Rx.Observable<any>;
  helloWorldLabelSubscription$: Rx.Observable<any>;

  constructor(private deviceManagerService: DeviceManagerService  ) {    

  }
    

  ngOnInit() {
    this.helloWorldLabelQuery$ = this.deviceManagerService.getHelloWorld$();
    this.helloWorldLabelSubscription$ = this.deviceManagerService.getEventSourcingMonitorHelloWorldSubscription$();
  }

  
  ngOnDestroy() {
  }

}
