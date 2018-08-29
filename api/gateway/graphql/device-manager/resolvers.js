const withFilter = require("graphql-subscriptions").withFilter;
const PubSub = require("graphql-subscriptions").PubSub;
const pubsub = new PubSub();
const Rx = require("rxjs");
const broker = require("../../broker/BrokerFactory")();

function getResponseFromBackEnd$(response) {
  return Rx.Observable.of(response).map(resp => {
    if (resp.result.code != 200) {
      const err = new Error();
      err.name = "Error";
      err.message = resp.result.error;
      // this[Symbol()] = resp.result.error;
      Error.captureStackTrace(err, "Error");
      throw err;
    }
    return resp.data;
  });
}

module.exports = {
  //// QUERY ///////

  Query: {
    getHelloWorldFrommsnamecamel(root, args, context) {
      return broker
        .forwardAndGetReply$(
          "HelloWorld",
          "gateway.graphql.query.getHelloWorldFrommsnamecamel",
          { root, args, jwt: context.encodedToken },
          2000
        )
        .mergeMap(response => getResponseFromBackEnd$(response))
        .toPromise();
    },
    getTags(root, args, context) {
        return broker.forwardAndGetReply$(
            "DeviceTag",
            "gateway.graphql.query.getTags",
            { root, args, jwt: context.encodedToken },
            2000
        )
        .mergeMap(response => getResponseFromBackEnd$(response))
        .toPromise();
    },
    deviceManagerGetTagTypes(root, args, context){
      return broker.forwardAndGetReply$(
        "DeviceTag",
        "gateway.graphql.query.getTagsTypes",
        { root, args, jwt: context.encodedToken },
        2000
      )
        .mergeMap(response => getResponseFromBackEnd$(response))
        .toPromise();
    }
  },

  //// MUTATIONS ///////
  Mutation: {
    persistBasicInfoTag(root, args, context) {
      // return 
      // RoleValidator.checkPermissions$(
      //   context.authToken.realm_access.roles,
      //   contextName,
      //   "persistBusiness",
      //   BUSINESS_PERMISSION_DENIED_ERROR_CODE,
      //   "Permission denied",
      //   ["business-manager"]
      // )
      return context.broker.forwardAndGetReply$(
        "DeviceTag",
        "gateway.graphql.mutation.persistBasicInfoTag",
        { root, args, jwt: context.encodedToken },
        2000
      )
        // .catch(err => handleError$(err, "persistBasicInfoTag"))
        .mergeMap(response => getResponseFromBackEnd$(response))
        .toPromise();
    },
    deviceManagerDeleteTag(root, args, context){
      return context.broker.forwardAndGetReply$(
        "DeviceTag",
        "gateway.graphql.mutation.deleteTag",
        { root, args, jwt: context.encodedToken },
        2000
      )
        // .catch(err => handleError$(err, "persistBasicInfoTag"))
        .mergeMap(response => getResponseFromBackEnd$(response))
        .toPromise();
    },
    deviceManagerAddAttributeToTag(root, args, context){
      return context.broker.forwardAndGetReply$(
        "DeviceTag",
        "gateway.graphql.mutation.addAttributeToTag",
        { root, args, jwt: context.encodedToken },
        2000
      )
        // .catch(err => handleError$(err, "persistBasicInfoTag"))
        .mergeMap(response => getResponseFromBackEnd$(response))
        .toPromise();
    },
    deviceManagerDeleteTagAttribute(root, args, context){
      return context.broker.forwardAndGetReply$(
        "DeviceTag",
        "gateway.graphql.mutation.deleteTagAttribute",
        { root, args, jwt: context.encodedToken },
        2000
      )
        // .catch(err => handleError$(err, "persistBasicInfoTag"))
        .mergeMap(response => getResponseFromBackEnd$(response))
        .toPromise();
    },
    deviceManagerEditBasicTagInfo(root, args, context){
      return context.broker.forwardAndGetReply$(
        "DeviceTag",
        "gateway.graphql.mutation.editBasicTagInfo",
        { root, args, jwt: context.encodedToken },
        2000
      )
        // .catch(err => handleError$(err, "persistBasicInfoTag"))
        .mergeMap(response => getResponseFromBackEnd$(response))
        .toPromise();
    },
    
    deviceManagerEditTagAttribute(root, args, context){
      return (
        context.broker
          .forwardAndGetReply$(
            "DeviceTag",
            "gateway.graphql.mutation.editTagAttribute",
            { root, args, jwt: context.encodedToken }, 2000)
          // .catch(err => handleError$(err, "persistBasicInfoTag"))
          .mergeMap(response => getResponseFromBackEnd$(response))
          .toPromise()
      );
    }

  },
  //// SUBSCRIPTIONS ///////
  Subscription: {
    msnamecamelHelloWorldSubscription: {
      subscribe: withFilter(
        (payload, variables, context, info) => {
          return pubsub.asyncIterator("msnamecamelHelloWorldSubscription");
        },
        (payload, variables, context, info) => {
          return true;
        }
      )
    }
  }
};

//// SUBSCRIPTIONS SOURCES ////

const eventDescriptors = [
  {
    backendEventName: "msnamecamelHelloWorldEvent",
    gqlSubscriptionName: "msnamecamelHelloWorldSubscription",
    dataExtractor: evt => evt.data, // OPTIONAL, only use if needed
    onError: (error, descriptor) =>
      console.log(`Error processing ${descriptor.backendEventName}`), // OPTIONAL, only use if needed
    onEvent: (evt, descriptor) =>
      console.log(`Event of type  ${descriptor.backendEventName} arraived`) // OPTIONAL, only use if needed
  }
];

/**
 * Connects every backend event to the right GQL subscription
 */
eventDescriptors.forEach(descriptor => {
  broker.getMaterializedViewsUpdates$([descriptor.backendEventName]).subscribe(
    evt => {
      if (descriptor.onEvent) {
        descriptor.onEvent(evt, descriptor);
      }
      const payload = {};
      payload[descriptor.gqlSubscriptionName] = descriptor.dataExtractor
        ? descriptor.dataExtractor(evt)
        : evt.data;
      pubsub.publish(descriptor.gqlSubscriptionName, payload);
    },

    error => {
      if (descriptor.onError) {
        descriptor.onError(error, descriptor);
      }
      console.error(`Error listening ${descriptor.gqlSubscriptionName}`, error);
    },

    () => console.log(`${descriptor.gqlSubscriptionName} listener STOPED`)
  );
});
