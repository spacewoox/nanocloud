/**
 * TeamController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  create: function(req, res) {
    console.log('creating the user');
    return res.ok(TeamService.create(req));
  },

  find: function(req, res) {
    return JsonApiService.findRecords(req, res);
  },

  users: function(req, res) {
    
    TeamService.find((err, teams) => {

      if (err) {
        return res.negotiate(err);
      }

      res.ok(teams);
    });
  }
};
