"use strict";

const deviceManager = require("../../domain/DeviceManager")();
const broker = require("../../tools/broker/BrokerFactory")();
const Rx = require("rxjs");
const jsonwebtoken = require("jsonwebtoken");
const jwtPublicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, "\n");

let instance;

class GraphQlService {


  constructor() {
    this.functionMap = this.generateFunctionMap();
    this.subscriptions = [];
  }

  /**
   * Starts GraphQL actions listener
   */
  start$() {
    //default on error handler
    const onErrorHandler = error => {
      console.error("Error handling  GraphQl incoming event", error);
      process.exit(1);
    };

    //default onComplete handler
    const onCompleteHandler = () => {
      () => console.log("GraphQlService incoming event subscription completed");
    };

    return Rx.Observable.from(this.getSubscriptionDescriptors())
    .map(aggregateEvent => {return { ...aggregateEvent, onErrorHandler, onCompleteHandler }})
      .map(params => this.subscribeEventHandler(params));
  }

  /**
   * build a Broker listener to handle GraphQL requests procesor
   * @param {*} descriptor 
   */
  subscribeEventHandler({
    aggregateType,
    messageType,
    onErrorHandler,
    onCompleteHandler
  }) {
    const handler = this.functionMap[messageType];
    const subscription = broker
      .getMessageListener$([aggregateType], [messageType])
      //decode and verify the jwt token
      .map(message => {
        return {
          authToken: jsonwebtoken.verify(message.data.jwt, jwtPublicKey),
          message
        };
      })
      //ROUTE MESSAGE TO RESOLVER
      .mergeMap(({ authToken, message }) =>
        handler.fn
          .call(handler.obj, message.data, authToken)
          .map(response => {
            return {
              response,
              correlationId: message.id,
              replyTo: message.attributes.replyTo
            };
          })
      )
      //send response back if neccesary
      .mergeMap(({ response, correlationId, replyTo }) => {
        if (replyTo) {
          return broker.send$(
            replyTo,
            "gateway.graphql.Query.response",
            response,
            { correlationId }
          );
        } else {
          return Rx.Observable.of(undefined);
        }
      })
      .subscribe(
        msg => {
          // console.log(`GraphQlService: ${messageType} process: ${msg}`);
        },
        onErrorHandler,
        onCompleteHandler
      );
    this.subscriptions.push({
      aggregateType,
      messageType,
      handlerName: handler.fn.name,
      subscription
    });
    return {
      aggregateType,
      messageType,
      handlerName: `${handler.obj.name}.${handler.fn.name}`
    };
  }

  stop$() {
    Rx.Observable.from(this.subscriptions).map(subscription => {
      subscription.subscription.unsubscribe();
      return `Unsubscribed: aggregateType=${aggregateType}, eventType=${eventType}, handlerName=${handlerName}`;
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  /////////////////// CONFIG SECTION, ASSOC EVENTS AND PROCESSORS BELOW  /////////////////
  ////////////////////////////////////////////////////////////////////////////////////////


  /**
   * returns an array of broker subscriptions for listening to GraphQL requests
   */
  getSubscriptionDescriptors() {   
    return [
      //Sample incoming request, please remove
      {
        aggregateType: "HelloWorld",
        messageType: "gateway.graphql.query.getHelloWorldFrommsnamecamel"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.query.getTagsTypes"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.query.getTags"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.mutation.persistBasicInfoTag"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.mutation.deleteTag"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.mutation.addAttributeToTag"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.mutation.deleteTagAttribute"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.mutation.getTagsTypes"
      },
      { 
        aggregateType: "Device",
        messageType: "gateway.graphql.mutation.editBasicTagInfo"
      },
      {
        aggregateType: "Device",
        messageType: "gateway.graphql.mutation.editTagAttribute"
      }
    ];
  }

  /**
   * returns a map that assocs GraphQL request with its processor
   */
  generateFunctionMap() {    
    return {
      //Sample incoming request, please remove
      "gateway.graphql.query.getHelloWorldFrommsnamecamel": {
        fn: deviceManager.getHelloWorld$,
        obj: deviceManager
      },
      "gateway.graphql.query.getTagsTypes": {
        fn: deviceManager.getTagsTypes$,
        obj: deviceManager
      },
      "gateway.graphql.query.getTags": {
        fn: deviceManager.getTags$,
        obj: deviceManager
      },
      "gateway.graphql.mutation.persistBasicInfoTag":{
        fn: deviceManager.persistBasicInfoTag$,
        obj: deviceManager
      },
      "gateway.graphql.mutation.deleteTag": {
        fn: deviceManager.deleteTag$,
        obj: deviceManager
      },
      "gateway.graphql.mutation.addAttributeToTag":{
        fn: deviceManager.addAttributeToTag$,
        obj: deviceManager
      },
      "gateway.graphql.mutation.deleteTagAttribute": {
        fn: deviceManager.deleteTagAttribute$,
        obj: deviceManager
      },
      "gateway.graphql.mutation.getTagsTypes":{
        fn: deviceManager.getTagsTypes$,
        obj: deviceManager
      },
      "gateway.graphql.mutation.editBasicTagInfo": {
        fn: deviceManager.editBasicTagInfo$,
        obj: deviceManager
      },
      "gateway.graphql.mutation.editTagAttribute": {
        fn: deviceManager.editTagAttribute$,
        obj: deviceManager
      }
    };
  }

}


module.exports = () => {
  if (!instance) {
    instance = new GraphQlService();
    console.log(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
