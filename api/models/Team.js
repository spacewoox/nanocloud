/**
 * Team.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      index: true,
      uuidv4: true,
    },
    id_user: {
      type: 'string',
      unique: true,
      uuidv4: true,
    },
    name: {
      type: 'string'
    },
  }
};

