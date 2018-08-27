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
    this.initHelloWorldEventGenerator();
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


  initHelloWorldEventGenerator(){
    Rx.Observable.interval(1000)
    .take(10)
    .mergeMap(id => DeviceManagerDA.getHelloWorld$())    
    .mergeMap(evt => {
      return broker.send$(MATERIALIZED_VIEW_TOPIC, 'msnamecamelHelloWorldEvent',evt);
    }).subscribe(
      (evt) => console.log('Gateway GraphQL sample event sent, please remove'),
      (err) => console.error('Gateway GraphQL sample event sent ERROR, please remove'),
      () => console.log('Gateway GraphQL sample event sending STOPPED, please remove'),
    );
  }

  getTags$({ args, jwt }, authToken){
    console.log(args);
    return DeviceManagerDA.getTags$(0,10, undefined, undefined, undefined)
    .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
    .catch(err => this.errorHandler$(err));

  }

  persistBasicInfoTag$({ args, jwt }, authToken) {    

    return eventSourcing.eventStore.emitEvent$(
      new Event({
        eventType: "BasicInfoTagCreated",
        eventTypeVersion: 1,
        aggregateType: "DeviceTag",
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

  handleBasicTagInfoCreated$(evt){
    console.log("========>", evt, "<=============");
    // return Rx.Observable.of(evt);
    return DeviceManagerDA.updateTag$(evt.data)
    .mergeMap(result => broker.send$(MATERIALIZED_VIEW_TOPIC, 'DeviceManagerUpdatedSubscriptioin', result.ops))
  }

  addAttributeToTag$({args, jwt}, authToken){
    return eventSourcing.eventStore.emitEvent$(
      new Event({
        eventType: "attributeToTagAdded",
        eventTypeVersion: 1,
        aggregateType: "DeviceTag",
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

  handleAttributeToTagAdded$(){
    
  }
 

  deleteAttributeFromTag$({args, jwt}, authToken){
    console.log("addAttributeToTag", args);
    return Rx.Observable.defer
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
