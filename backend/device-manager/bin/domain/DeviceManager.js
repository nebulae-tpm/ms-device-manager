"use strict";

const Rx = require("rxjs");
const eventSourcing = require("../tools/EventSourcing")();
const Event = require("@nebulae/event-store").Event;
const RoleValidator = require("../tools/RoleValidator");
const DeviceManagerDA = require("../data/DeviceManagerDA");
const { PERMISSION_DENIED_ERROR } = require("../tools/ErrorCodes");
const { CustomError, DefaultError } = require("../tools/customError");

/**
 * Singleton instance
 */
let instance;

class DeviceManager {
  constructor() {}

  /**
   * Query to fetch the total tag count
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  getTagCount$({ args, jwt }, authToken) {
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
   * Query to fetch tag info object
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  getTags$({ args, jwt }, authToken) {
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "getTags$",
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

  /**
   * Query to create basic tag info object
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  createtBasicInfoTag$({ args, jwt }, authToken) {
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "createtBasicInfoTag$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() =>
        eventSourcing.eventStore.emitEvent$(
          new Event({
            eventType: "BasicInfoTagCreated",
            eventTypeVersion: 1,
            aggregateType: "Device",
            aggregateId: Date.now(),
            data: args.input,
            user: authToken.preferred_username
          })
        )
      )
      .map(() => ({ code: 200, message: "persistBasicInfoTag$" }))
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

   /**
   * Query to edit basic tag info object
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  editBasicTagInfo$({ args, jwt }, authToken) {
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "editBasicTagInfo$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() =>
        eventSourcing.eventStore.emitEvent$(
          new Event({
            eventType: "BasicInfoTagEdited",
            eventTypeVersion: 1,
            aggregateType: "Device",
            aggregateId: Date.now(),
            data: args,
            user: authToken.preferred_username
          })
        )
      )
      .map(() => ({ code: 200, message: "editBasicTagInfo$" }))
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

   /**
   * Query to fetch the several tag types
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  getTagsTypes$({ args, jwt }, authToken) {
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "getTagsTypes$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() => DeviceManagerDA.getTagTypes$())
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

   /**
   * Query to create basic tag info object
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  deleteTag$({ args, jwt }, authToken) {
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "deleteTag$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() =>
        eventSourcing.eventStore.emitEvent$(
          new Event({
            eventType: "TagRemoved",
            eventTypeVersion: 1,
            aggregateType: "Device",
            aggregateId: Date.now(),
            data: args,
            user: authToken.preferred_username
          })
        )
      )
      .map(() => ({ code: 200, message: "deleteTag$" }))
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

   /**
   * Query to add attribute to tag
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  addAttributeToTag$({ args, jwt }, authToken) {
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "addAttributeToTag$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() =>
        eventSourcing.eventStore.emitEvent$(
          new Event({
            eventType: "TagAttributeAdded",
            eventTypeVersion: 1,
            aggregateType: "Device",
            aggregateId: Date.now(),
            data: args,
            user: authToken.preferred_username
          })
        )
      )
      .map(() => ({ code: 200, message: "persistBasicInfoTag$" }))
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

   /**
   * Query to delete tag object
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  deleteTagAttribute$({ args, jwt }, authToken) {
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "deleteTagAttribute$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() =>
        eventSourcing.eventStore.emitEvent$(
          new Event({
            eventType: "TagAttributeRemoved",
            eventTypeVersion: 1,
            aggregateType: "Device",
            aggregateId: Date.now(),
            data: args,
            user: authToken.preferred_username
          })
        )
      )
      .map(() => ({ code: 200, message: "persistBasicInfoTag$" }))
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

   /**
   * Query to edit an tag attribute
   * @param {any} param0 Object with args and jwt objects 
   * @param {any} authToken Decoded token
   */
  editTagAttribute$({ args, jwt }, authToken) {
    return RoleValidator.checkPermissions$(
      authToken.realm_access.roles,
      "DeviceManager",
      "editTagAttribute$",
      PERMISSION_DENIED_ERROR,
      ["operator"]
    )
      .mergeMap(() =>
        eventSourcing.eventStore.emitEvent$(
          new Event({
            eventType: "TagAttributeEdited",
            eventTypeVersion: 1,
            aggregateType: "Device",
            aggregateId: Date.now(),
            data: args,
            user: authToken.preferred_username
          })
        )
      )
      .map(() => ({ code: 200, message: "editTagAttribute$" }))
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
    return Rx.Observable.of(rawRespponse).map(resp => ({
      data: resp,
      result: { code: 200 }
    }));
  }

  //#endregion
}

/**
 * @returns {DeviceManager}
 */
module.exports = () => {
  if (!instance) {
    instance = new DeviceManager();
    console.log(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
