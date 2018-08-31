"use strict";

const Rx = require("rxjs");
const broker = require("../tools/broker/BrokerFactory")();
const MATERIALIZED_VIEW_TOPIC = "materialized-view-updates";

/**
 * Singleton instance
 */
let instance;

class UserEventConsumer {
    constructor() { }



}

module.exports = () => {
    if (!instance) {
        instance = new UserEventConsumer();
        console.log(`${instance.constructor.name} Singleton created`);
    }
    return instance;
};