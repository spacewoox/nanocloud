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

// jshint mocha:true

/* global ConfigService, OwncloudService */

const expect = require('chai').expect;
const username = "nanoUser";
const groupname = "nanoGroup";

describe("OwncloudService", function() {

  before(function(done) {
    ConfigService.set("owncloudAdminUsername", "nanocloud")
    .then(() => {
      return ConfigService.set("owncloudAdminPassword", "Nanocloud123+");
    })
    .then(() => {
      return ConfigService.set("owncloudURL", "localhost");
    })
    .then(() => {
      return ConfigService.set("owncloudPort", "8082");
    })
    .then(() => {
      OwncloudService.initialize();
      return done();
    });
  });

  describe('Create a user', function() {
    it('Should return success', (done) => {
      return OwncloudService.createUser(username)
      .then((res) => {
        done();
      });
    });
  });

  describe('Create a group', function() {
    it('Should return success', (done) => {
      return OwncloudService.createGroup(groupname)
      .then((res) => {
        console.log(res);
        console.log(res.body);
        done();
      });
    });
  });

  describe('Grant user administration rights on a group', function() {
    it('Should return success', (done) => {
      return OwncloudService.grantGroupAdmin(username, groupname)
      .then((res) => {
        done();
      });
    });
  });

  describe('Revoke user administration rights on a group', function() {
    it('Should return success', (done) => {
      return OwncloudService.revokeGroupAdmin(username, groupname)
      .then((res) => {
        done();
      });
    });
  });

  describe('Assign user to a group', function() {
    it('Should return success', (done) => {
      return OwncloudService.assignUserToGroup(username, groupname)
      .then((res) => {
        done();
      });
    });
  });

  describe('Remove user to from group', function() {
    it('Should return success', (done) => {
      return OwncloudService.removeUserFromGroup(username, groupname)
      .then((res) => {
        done();
      });
    });
  });

  describe('Delete a group', function() {
    it('Should return success', (done) => {
      return OwncloudService.deleteGroup(groupname)
      .then((res) => {
        done();
      });
    });
  });

  describe('Delete a user', function() {
    it('Should return success', (done) => {
      return OwncloudService.deleteUser(groupname)
      .then((res) => {
        done();
      });
    });
  });
});
