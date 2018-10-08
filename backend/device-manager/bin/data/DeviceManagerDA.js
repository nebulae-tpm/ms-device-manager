'use strict'

let mongoDB = undefined;
// const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');
const CollectionName = "DeviceManager";//please change
const { CustomError } = require('../tools/customError');


class DeviceManagerDA {

  static start$(mongoDbInstance) {
    return Rx.Observable.create((observer) => {
      if (mongoDbInstance) {
        mongoDB = mongoDbInstance;
        observer.next('using given mongo instance');
      } else {
        mongoDB = require('./MongoDB').singleton();
        observer.next('using singleton system-wide mongo instance');
      }
      observer.complete();
    });
  }
  


  static getTagTypes$(){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.distinct('type'));
  }

  /**
 * gets all the tags registered.
 *
 * @param {int} page Indicates the page number which will be returned
 * @param {int} count Indicates the amount of rows that will be returned
 * @param {filter} filter filter to apply to the query.
 * @param {sortColumn} sortColumn Indicates what column will be used to sort the data
 * @param {order} order Indicates if the info will be asc or desc
 */
  static getTags$(page, count, filter, sortColumn, order) {
    let filterObject = {};
    const orderObject = {};
    if (filter && filter != "") {
      filterObject = {
        $or: [
          { 'name': { $regex: `${filter}.*`, $options: "i" } },
          { 'type': { $regex: `${filter}.*`, $options: "i" } }
        ]
      };
    }

    if (sortColumn && order) {
      let column = sortColumn;
      orderObject[column] = order == 'asc' ? 1 : -1;
    }
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() =>
      collection
        .find(filterObject)
        .sort(orderObject)
        .skip(count * page)
        .limit(count)
        .toArray()
    );
  }
 
  // save a tag document
  static createTag$(tag){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.save({...tag}));
  }

  static updateTag$(tagName, tag){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.updateOne(
      {name: tagName},
      { $set: { ...tag} },
      {upsert: true}
    ));
  }

  static deleteTag$({tagName}){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.deleteOne( {name: tagName} ));
  }
  static deleteTagAttribute$({tagName, tagAttributeName}){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.update(
      { name: tagName },
      { $pull: { 'attributes': { key: tagAttributeName } } },
      { multi: false }
    ))
  }

  static addAttributeToTag({tagName, input}){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.update(
      { name: tagName },
      { $push: { attributes: input } }
    ) )
  }
  static editTagAttribute$({tagName, tagAttributeName, input}){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.updateOne(
      { name: tagName, 'attributes.key': tagAttributeName },
      { $set: { 'attributes.$': input } }
    ))
  }

  static getOneTag$(namw){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.findOne( {name: name} ));
  }

  static getTotalTagCount$(){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.fromPromise(collection.count());
  }




}

module.exports =  DeviceManagerDA 