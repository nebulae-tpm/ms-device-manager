"use strict";

const broker = require("../tools/broker/BrokerFactory")();
const MATERIALIZED_VIEW_TOPIC = "materialized-view-updates";
const DeviceManagerDA = require("../data/DeviceManagerDA");

/**
 * Singleton instance
 */
let instance;

class DeviceManagerEventConsumer {
  constructor() {}

  /**
   * 
   * @param {any} evt event required to create a basic tag info object 
   */
  handleBasicTagInfoCreated$(evt) {
    return DeviceManagerDA.createTag$(evt.data).mergeMap(result =>
      broker.send$(
        MATERIALIZED_VIEW_TOPIC,
        "DeviceManagerBasicTagInfoCreated",
        result.ops
      )
    );
  }

  /**
   * 
   * @param {any} evt Event required to remove a tag 
   */
  handleTagRemoved$(evt) {
    return DeviceManagerDA.deleteTag$(evt.data).mergeMap(result =>
      broker.send$(
        MATERIALIZED_VIEW_TOPIC,
        "DeviceManagerTagRemoved",
        result.ops
      )
    );
  }
  /**
   * 
   * @param {any} evt Event required to add an attribute at some tag
   */
  handleTagAttributeAdded$(evt) {
    return DeviceManagerDA.addAttributeToTag(evt.data).mergeMap(result =>
      broker.send$(
        MATERIALIZED_VIEW_TOPIC,
        "handleTagAttributeAdded",
        result.ops
      )
    );
  }

  /**
   * 
   * @param {any} evt  Event required to remove an attribute from some tag
   */
  handleTagAttributeRemoved$(evt) {
    return DeviceManagerDA.deleteTagAttribute$(evt.data).mergeMap(result =>
      broker.send$(
        MATERIALIZED_VIEW_TOPIC,
        "handleTagAttributeRemoved",
        result.ops
      )
    );
  }

  /**
   * 
   * @param {any} evt Event required to edit some tag
   */
  handleBasicInfoTagEdited$(evt) {
    return DeviceManagerDA.updateTag$(evt.data.tagName, data.input);
  }

  /**
   * 
   * @param {any} evt Event required to edit an tag attribute
   */
  handleTagAttributeEdited$(evt) {
    return DeviceManagerDA.editTagAttribute$(evt.data)
      .mergeMap(result =>
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "handleTagAttributeRemoved",
          result.ops
        )
      );
  }
}

/**
 * @returns {DeviceManagerEventConsumer}
 */
module.exports = () => {
  if (!instance) {
    instance = new DeviceManagerEventConsumer();
    console.log(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
