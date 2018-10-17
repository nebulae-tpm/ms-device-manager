'use strict'

let mongoDB = undefined;
const Rx = require('rxjs');
const CollectionName = "DeviceManager";


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
 
  /**
   * Create a new tag document.
   * @param {any} tag Tag object
   */
  static createTag$(tag){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.save({...tag}));
  }

  /**
   * Updates a tag document
   * @param {string} tagName Tag name
   * @param {any} tag Update tag object  
   */
  static updateTag$(tagName, tag){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.updateOne(
      {name: tagName},
      { $set: { ...tag} },
      {upsert: true}
    ));
  }

  /**
   * Delete a tag document
   * @param {*} param0 
   */
  static deleteTag$({tagName}){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.deleteOne( {name: tagName} ));
  }
  /**
   * Delete a tag attribute from a Tag document
   * @param {*} param0 
   */
  static deleteTagAttribute$({tagName, tagAttributeName}){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.update(
      { name: tagName },
      { $pull: { 'attributes': { key: tagAttributeName } } },
      { multi: false }
    ))
  }

  /**
   * Inserts an attribute to the tag document
   * @param {*} param0 
   */
  static addAttributeToTag({tagName, input}){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.update(
      { name: tagName },
      { $push: { attributes: input } }
    ) )
  }
  /**
   * edits a tag attribute
   * @param {*} param0 
   */
  static editTagAttribute$({tagName, tagAttributeName, input}){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.updateOne(
      { name: tagName, 'attributes.key': tagAttributeName },
      { $set: { 'attributes.$': input } }
    ))
  }

  /**
   * fetch the tag count
   */
  static getTotalTagCount$(){
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.fromPromise(collection.count());
  }
}
/**
 * @returns {DeviceManagerDA}
 */
module.exports =  DeviceManagerDA 