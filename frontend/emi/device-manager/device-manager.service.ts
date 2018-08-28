import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs';
import { GatewayService } from '../../../api/gateway.service';
import {
  getHelloWorld,
  DeviceManagerHelloWorldSubscription,
  getTagByPages,
  PersistBasicInfoTag,
  addAttributeToTag,
  RemoveTag,
  RemoveTagAttribute,
  getAllTagTypes
} from './gql/DeviceManager';

@Injectable()
export class DeviceManagerService {

  tagTypes: string[] = [];

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

  fecthTagTypes() {
    return this.gateway.apollo
      .query<any>({
        query: getAllTagTypes,
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      })
      .map(r => r.data.deviceManagerGetTagTypes);
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


  createTagElement$(basicInfoTag: {name: string , type: string}){
    return this.gateway.apollo
    .mutate<any>({
      mutation: PersistBasicInfoTag,
      variables: {
        input: basicInfoTag
      },
      errorPolicy: 'all'
    });
  }

  RemoveTagElement(TagToRemove: string){
    return this.gateway.apollo
    .mutate<any>({
      mutation: RemoveTag,
      variables: {
        tagName: TagToRemove
      }
    });
  }

  addAttributeToTag(tagName: string, attribute: {key: string, value: string}){
    return this.gateway.apollo
    .mutate<any>({
      mutation: addAttributeToTag,
      variables: {
        tagName: tagName,
        input: attribute
      },
      errorPolicy: 'all'
    });
  }

  removeTagAttribute(tagName, tagAttributeName){
    return this.gateway.apollo
    .mutate<any>({
      mutation: RemoveTagAttribute,
      variables: {
        tagName: tagName,
        tagAttributeName: tagAttributeName
      }
    });
  }

}
