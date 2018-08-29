"use strict";

const Rx = require("rxjs");
const eventSourcing = require("../tools/EventSourcing")();
const Event = require("@nebulae/event-store").Event;
const DeviceManagerDA = require("../data/DeviceManagerDA");
const broker = require("../tools/broker/BrokerFactory")();
const MATERIALIZED_VIEW_TOPIC = "materialized-view-updates";
const {
  CustomError,
  DefaultError
} = require("../tools/customError");


/**
 * Singleton instance
 */
let instance;

class DeviceManager {
  constructor() {
    // this.initHelloWorldEventGenerator();
  }

  /**
   *  HelloWorld Query, please remove
   *  this is a queiry form GraphQL
   */
  getHelloWorld$(request) {
    console.log(`request: request`)
    return DeviceManagerDA.getHelloWorld$()
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }


  /**
   * Handle HelloWorld Query, please remove
   * This in an Event HAndler for Event- events
   */
  handleHelloWorld$(evt) {
    return Rx.Observable.of('Some process for HelloWorld event');
  }



  getTags$({ args, jwt }, authToken){
    console.log("getTags", args);
    return DeviceManagerDA.getTags$(0,10, undefined, undefined, undefined)
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));

  }

  persistBasicInfoTag$({ args, jwt }, authToken) {    

    return eventSourcing.eventStore.emitEvent$(
      new Event({
        eventType: "BasicInfoTagCreated",
        eventTypeVersion: 1,
        aggregateType: "Device",
        aggregateId: Date.now(),
        data: args.input,
        user: authToken.preferred_username
      })
    )
      .map(r => {
        return {
          code: 200,
          message: "persistBasicInfoTag$"
        }
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  editBasicTagInfo$({ args, jwt }, authToken){
    return eventSourcing.eventStore.emitEvent$(
      new Event({
        eventType: "BasicInfoTagEdited",
        eventTypeVersion: 1,
        aggregateType: "Device",
        aggregateId: Date.now(),
        data: args,
        user: authToken.preferred_username
      })
    )
      .map(r => {
        return {
          code: 200,
          message: "editBasicTagInfo$"
        }
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  handleBasicInfoTagEdited$({data}){
    console.log("handleBasicInfoTagEdited", data);
    return DeviceManagerDA.updateTag$(data.tagName, data.input );
  }
  

  getTagsTypes$({ args, jwt }, authToken){
    return DeviceManagerDA.getTagTypes$()
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));
  }

  handleBasicTagInfoCreated$(evt){
    return DeviceManagerDA.createTag$(evt.data)
    .mergeMap(result => broker.send$(MATERIALIZED_VIEW_TOPIC, 'DeviceManagerBasicTagInfoCreated', result.ops))
  }

  deleteTag$({ args, jwt }, authToken){
    return eventSourcing.eventStore.emitEvent$(
      new Event({
        eventType: "TagRemoved",
        eventTypeVersion: 1,
        aggregateType: "Device",
        aggregateId: Date.now(),
        data: args,
        user: authToken.preferred_username
      })
    )
      .map(r => {
        return {
          code: 200,
          message: "deleteTag$"
        }
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  handleTagRemoved$(evt){
    console.log("handleTagRemoved", evt.data);
    return DeviceManagerDA.deleteTag$(evt.data)
    .mergeMap(result => broker.send$(MATERIALIZED_VIEW_TOPIC, 'DeviceManagerTagRemoved', result.ops))
  }

  addAttributeToTag$({args, jwt}, authToken){
    return eventSourcing.eventStore.emitEvent$(
      new Event({
        eventType: "TagAttributeAdded",
        eventTypeVersion: 1,
        aggregateType: "Device",
        aggregateId: Date.now(),
        data: args,
        user: authToken.preferred_username
      })
    )
    .map(r => {
      return {
        code: 200,
        message: "persistBasicInfoTag$"
      }
    })
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));
  }

  handleTagAttributeAdded$(evt){
    console.log("handleTagAttributeAdded", evt.data);
    // return Rx.Observable.of(evt.data);
    return DeviceManagerDA.addAttributeToTag(evt.data)
    .mergeMap(result => broker.send$(MATERIALIZED_VIEW_TOPIC, 'handleTagAttributeAdded', result.ops))
  }
 

  deleteTagAttribute$({args, jwt}, authToken){

    console.log("deleteTagAttribute", args);
    return eventSourcing.eventStore.emitEvent$(
      new Event({
        eventType: "TagAttributeRemoved",
        eventTypeVersion: 1,
        aggregateType: "Device",
        aggregateId: Date.now(),
        data: args,
        user: authToken.preferred_username
      })
    )
    .map(r => {
      return {
        code: 200,
        message: "persistBasicInfoTag$"
      }
    })
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));
  }

  handleTagAttributeRemoved$(evt){
    console.log("handleTagAttributeRemoved", evt.data);
    return DeviceManagerDA.deleteTagAttribute$(evt.data)
    .mergeMap(result => broker.send$(MATERIALIZED_VIEW_TOPIC, 'handleTagAttributeRemoved', result.ops))
  }

  editTagAttribute$({args, jwt}, authToken){
    return eventSourcing.eventStore.emitEvent$(
      new Event({
        eventType: "TagAttributeEdited",
        eventTypeVersion: 1,
        aggregateType: "Device",
        aggregateId: Date.now(),
        data: args,
        user: authToken.preferred_username
      })
    )
    .map(r => {
      return {
        code: 200,
        message: "editTagAttribute$"
      }
    })
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));
  }

  handleTagAttributeEdited$(evt){
    console.log("handleTagAttributeEdited", evt.data);
    return DeviceManagerDA.editTagAttribute$(evt.data)
    .do(r => console.log(r.result))  
    .mergeMap(result => broker.send$(MATERIALIZED_VIEW_TOPIC, 'handleTagAttributeRemoved', result.ops))
  }



  //#region  mappers for API responses
  errorHandler$(err) {
    return Rx.Observable.of(err)
      .map(err => {
        const exception = { data: null, result: {} };
        const isCustomError = err instanceof CustomError;
        if(!isCustomError){
          err = new DefaultError(err)
        }
        exception.result = {
            code: err.code,
            error: {...err.getContent()}
          }
        return exception;
      });
  }

  
  buildSuccessResponse$(rawRespponse) {
    return Rx.Observable.of(rawRespponse)
      .map(resp => {
        return {
          data: resp,
          result: {
            code: 200
          }
        }
      });
  }

  //#endregion


}

module.exports = () => {
  if (!instance) {
    instance = new DeviceManager();
    console.log(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
