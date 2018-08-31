import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs';
import { GatewayService } from '../../../api/gateway.service';
import {
  getTotalTagCount,
  getTagByPages,
  PersistBasicInfoTag,
  addAttributeToTag,
  RemoveTag,
  RemoveTagAttribute,
  getAllTagTypes,
  EditBAsicTagInfo,
  editTagAttribute
} from './gql/DeviceManager';

@Injectable()
export class DeviceManagerService {

  tagTypes: string[] = [];

  constructor(private gateway: GatewayService) {
  }


  fecthTotalTagCount$() {
    return this.gateway.apollo
      .query<any>({
        query: getTotalTagCount,
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      });
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
          count: count,
          filterText: filterText,
          sortColumn: sortColumn,
          sortOrder: sortOrder
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

  editBasicTagInfo(tagName: string, basicInfoTag: {name: string , type: string}){
    return this.gateway.apollo
    .mutate<any>({
      mutation: EditBAsicTagInfo,
      variables: {
        tagName: tagName,
        input: basicInfoTag
      }
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

  editTagAttribute(tagName: string, tagAttributeName: string, input: {key: string, value: string}){
    return this.gateway.apollo
    .mutate<any>({
      mutation: editTagAttribute,
      variables: {
        tagName: tagName,
        tagAttributeName: tagAttributeName,
        input: input
      }
    });
  }

}
