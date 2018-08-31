"use strict";

const Rx = require("rxjs");
const broker = require("../tools/broker/BrokerFactory")();
const MATERIALIZED_VIEW_TOPIC = "materialized-view-updates";
const DeviceManagerDA = require("../data/DeviceManagerDA");

/**
 * Singleton instance
 */
let instance;

class UserEventConsumer {
  constructor() {}

  handleBasicTagInfoCreated$(evt) {
    return DeviceManagerDA.createTag$(evt.data).mergeMap(result =>
      broker.send$(
        MATERIALIZED_VIEW_TOPIC,
        "DeviceManagerBasicTagInfoCreated",
        result.ops
      )
    );
  }

  handleTagRemoved$(evt) {
    console.log("handleTagRemoved", evt.data);
    return DeviceManagerDA.deleteTag$(evt.data).mergeMap(result =>
      broker.send$(
        MATERIALIZED_VIEW_TOPIC,
        "DeviceManagerTagRemoved",
        result.ops
      )
    );
  }
  handleTagAttributeAdded$(evt) {
    console.log("handleTagAttributeAdded", evt.data);
    // return Rx.Observable.of(evt.data);
    return DeviceManagerDA.addAttributeToTag(evt.data).mergeMap(result =>
      broker.send$(
        MATERIALIZED_VIEW_TOPIC,
        "handleTagAttributeAdded",
        result.ops
      )
    );
  }

  handleTagAttributeRemoved$(evt) {
    console.log("handleTagAttributeRemoved", evt.data);
    return DeviceManagerDA.deleteTagAttribute$(evt.data).mergeMap(result =>
      broker.send$(
        MATERIALIZED_VIEW_TOPIC,
        "handleTagAttributeRemoved",
        result.ops
      )
    );
  }

  handleBasicInfoTagEdited$({ data }) {
    console.log("handleBasicInfoTagEdited", data);
    return DeviceManagerDA.updateTag$(data.tagName, data.input);
  }

  handleTagAttributeEdited$(evt) {
    console.log("handleTagAttributeEdited", evt.data);
    return DeviceManagerDA.editTagAttribute$(evt.data)
      .do(r => console.log(r.result))
      .mergeMap(result =>
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "handleTagAttributeRemoved",
          result.ops
        )
      );
  }
}

module.exports = () => {
  if (!instance) {
    instance = new UserEventConsumer();
    console.log(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
