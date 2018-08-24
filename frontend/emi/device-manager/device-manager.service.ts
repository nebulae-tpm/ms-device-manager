import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs';
import { GatewayService } from '../../../api/gateway.service';
import {
  getHelloWorld,
  DeviceManagerHelloWorldSubscription,
  getTagByPages
} from './gql/DeviceManager';

@Injectable()
export class DeviceManagerService {


  constructor(private gateway: GatewayService) {

  }

  /**
   * Hello World sample, please remove
   */
  getHelloWorld$() {
    return this.gateway.apollo
      .watchQuery<any>({
        query: getHelloWorld,
        fetchPolicy: "network-only"
      })
      .valueChanges.map(
        resp => resp.data.getHelloWorldFrommsnamecamel.sn
      );
  }

  /**
  * Hello World subscription sample, please remove
  */
 getEventSourcingMonitorHelloWorldSubscription$(): Observable<any> {
  return this.gateway.apollo
    .subscribe({
      query: DeviceManagerHelloWorldSubscription
    })
    .map(resp => resp.data.msnamecamelHelloWorldSubscription.sn);
}

  getTagsByPages$(page: number, count: number, filterText?: string, sortColumn?: string , sortOrder?: string) {
    return this.gateway.apollo
      .subscribe({
        query: getTagByPages,
        variables: {
          page: page,
          count: count
        }
      })
      .map(resp => resp.data.getTags);
  }

}
