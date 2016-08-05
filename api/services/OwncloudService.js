/**
 * Nanocloud turns any traditional software into a cloud solution, without
 * changing or redeveloping existing source code.
 *
 * Copyright (C) 2016 Nanocloud Software
 *
 * This file is part of Nanocloud.
 *
 * Nanocloud is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Nanocloud is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General
 * Public License
 * along with this program.  If not, see
 * <http://www.gnu.org/licenses/>.
 */

/* globals ConfigService */

const request = require("request-promise");
const Promise = require("bluebird");

let _owncloudURL = null;

function initialize() {
  return ConfigService.get(
      'owncloudURL',
      'owncloudPort',
      'owncloudAdminUsername',
      'owncloudAdminPassword')
    .then((configs) => {
      _owncloudURL = "http://" +
        configs.owncloudAdminUsername + ":" +
        configs.owncloudAdminPassword + "@" +
        configs.owncloudURL + ":" +
        configs.owncloudPort + "/ocs/v1.php/cloud";
      return Promise.resolve(_owncloudURL);
    })
    .catch((err) => {
      Promise.reject(err);
    });
}

module.exports = {

  initialize,

  /**
   * createUser
   *
   * Create a new owncloud account
   *
   * @param {string} Owncloud account's username
   * @param {string} Owncloud account's password
   */
  createUser: function(username, password) {

    let options = {
      url: _owncloudURL + "/users",
      form: {
        "userid": username,
        "password": password
      },
      method: 'POST'
    };

    return request(options);
  },

  /**
   * createGroup
   *
   * Create a new owncloud group
   *
   * @param {string} Owncloud account's username
   * @param {string} Owncloud account's password
   */
  createGroup: function(groupname) {
    let options = {
      url: _owncloudURL + "/groups",
      form: {
        "groupid": groupname
      },
      method: 'POST'
    };

    return request(options);
  },

  /**
   * GrantGroupAdmin
   *
   * Grant group administartion rights to a user on a group
   *
   * @param {string} Owncloud account's username
   * @param {string} Owncloud account's group name
   */
  grantGroupAdmin: function(username, groupname) {
    let options = {
      url: _owncloudURL + "/users/" + username + "/subadmins",
      form: {
        "groupid": groupname
      },
      method: 'POST'
    };

    return request(options);
  },

  /**
   * RevokeGroupAdmin
   *
   * Revoke group administartion rights to a user on a group
   *
   * @param {string} Owncloud account's username
   * @param {string} Owncloud account's group name
   */
  revokeGroupAdmin: function(username, groupname) {
    let options = {
      url: _owncloudURL + "/users/" + username + "/subadmins",
      form: {
        "groupid": groupname
      },
      method: 'DELETE'
    };

    return request(options);
  },

  /**
   * assignUserToGroup
   *
   * Assign a user to a group
   *
   * @param {string} Owncloud account's username
   * @param {string} Owncloud account's group name
   */
  assignUserToGroup: function(username, groupname) {
    let options = {
      url: _owncloudURL + "/users/" + username + "/groups",
      form: {
        "groupid": groupname
      },
      method: 'POST'
    };

    return request(options);
  },

  /**
   * removeUserFromGroup
   *
   * Remove a user from a group
   *
   * @param {string} Owncloud account's username
   * @param {string} Owncloud account's group name
   */
  removeUserFromGroup: function(username, groupname) {
    let options = {
      url: _owncloudURL + "/users/" + username + "/groups",
      form: {
        "groupid": groupname
      },
      method: 'DELETE'
    };

    return request(options);
  },

  /**
   * deleteGroup
   *
   * Delete a group
   *
   * @param {string} Owncloud account's group name
   */
  deleteGroup: function(groupname) {
    let options = {
      url: _owncloudURL + "/groups/" + groupname,
      method: 'DELETE'
    };

    return request(options);
  },

  /**
   * deleteUser
   *
   * Delete a user
   *
   * @param {string} Owncloud account's username
   */
  deleteUser: function(username) {
    let options = {
      url: _owncloudURL + "/users/" + username,
      method: 'DELETE'
    };

    return request(options);
  }
};
