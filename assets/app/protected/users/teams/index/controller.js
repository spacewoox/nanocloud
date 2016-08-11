import Ember from 'ember';

export default Ember.Controller.extend({
  teamController: Ember.inject.controller('protected.users.teams'),
  teams: Ember.computed.oneWay('teamController.teams'),
  hasTeam: Ember.computed.notEmpty('session.user.team'),
  session: Ember.inject.service('session'),

  sortableTableConfig: {

    filteringIgnoreCase: true,
    messageConfig: {
      searchLabel: "Search",
    },

    customIcons: {
      "sort-asc": "fa fa-caret-up",
      "sort-desc": "fa fa-caret-down",
      "caret": "fa fa-minus",
      "column-visible": "fa fa-minus",
    },

    customClasses: {
      "pageSizeSelectWrapper": "pagination-number"
    }
  },

  columns: [
    {
      "title": "Name",
      "disableFiltering": true,
      "filterWithSelect": false,
      "template": "protected/users/teams/index/table/user-name",
    },
    {
      "propertyName": "email",
      "title": "Email",
      "disableFiltering": true,
      "filterWithSelect": false,
    },
    {
      "title": "Status",
      "sortDirection": "asc",
      "sortPrecedence": 0,
      "disableFiltering": true,
      "filterWithSelect": false,
      "template": "protected/users/teams/index/table/activated-user",
    }
  ],

  actions: {
    createTeam() {
      this.get('model').save()
        .then((team) => {
          this.toast.success('Team has been created successfully');
          this.get('session.user').set('team', team.get('id'));
          this.send('refreshModel')
        })
        .catch(() => {
          this.toast.error('An error occured. Team has not been created');
        })
    }
  }
});
