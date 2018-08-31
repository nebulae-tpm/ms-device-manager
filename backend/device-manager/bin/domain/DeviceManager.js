"use strict";

const Rx = require("rxjs");
const eventSourcing = require("../tools/EventSourcing")();
const Event = require("@nebulae/event-store").Event;
const broker = require("../tools/broker/BrokerFactory")();
const RoleValidator = require("../tools/RoleValidator");
const DeviceManagerDA = require("../data/DeviceManagerDA");
const { PERMISSION_DENIED_ERROR } = require("../tools/ErrorCodes");
const MATERIALIZED_VIEW_TOPIC = "materialized-view-updates";
const { CustomError, DefaultError } = require("../tools/customError");

/**
 * Singleton instance
 */
let instance;

class DeviceManager {
  constructor() {}

  /**
   *
   * @param {*} args query arguments
   * @param { string } jwt JWT token
   * @param { string } authToken Decoded token
   */
  getTagCount$({ args, jwt }, authToken) {
    console.log(args);
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "getTagCount$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() => DeviceManagerDA.getTotalTagCount$())
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  /**
   *
   * @param {*} args Query arguments
   * @param { string } jwt JWT token
   * @param { string } authToken decoded token
   */
  getTags$({ args, jwt }, authToken) {
    console.log("getTags", args);
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "getTagCount$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() =>
        DeviceManagerDA.getTags$(
          args.page,
          args.count,
          args.filterText,
          args.sortColumn,
          args.sortOrder
        )
      )
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  createtBasicInfoTag$({ args, jwt }, authToken) {
    return eventSourcing.eventStore
      .emitEvent$(
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
        };
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  editBasicTagInfo$({ args, jwt }, authToken) {
    return eventSourcing.eventStore
      .emitEvent$(
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
        };
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  getTagsTypes$({ args, jwt }, authToken) {
    return DeviceManagerDA.getTagTypes$()
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  deleteTag$({ args, jwt }, authToken) {
    return eventSourcing.eventStore
      .emitEvent$(
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
        };
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  addAttributeToTag$({ args, jwt }, authToken) {
    return eventSourcing.eventStore
      .emitEvent$(
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
        };
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  deleteTagAttribute$({ args, jwt }, authToken) {
    console.log("deleteTagAttribute", args);
    return eventSourcing.eventStore
      .emitEvent$(
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
        };
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  editTagAttribute$({ args, jwt }, authToken) {
    return eventSourcing.eventStore
      .emitEvent$(
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
        };
      })
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  //#region  mappers for API responses
  errorHandler$(err) {
    return Rx.Observable.of(err).map(err => {
      const exception = { data: null, result: {} };
      const isCustomError = err instanceof CustomError;
      if (!isCustomError) {
        err = new DefaultError(err);
      }
      exception.result = {
        code: err.code,
        error: { ...err.getContent() }
      };
      return exception;
    });
  }

  buildSuccessResponse$(rawRespponse) {
    return Rx.Observable.of(rawRespponse).map(resp => {
      return {
        data: resp,
        result: {
          code: 200
        }
      };
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
