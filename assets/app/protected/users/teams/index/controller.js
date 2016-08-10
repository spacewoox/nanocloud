import Ember from 'ember';

export default Ember.Controller.extend({
  teamController: Ember.inject.controller('protected.users.teams'),
  teams: Ember.computed.oneWay('teamController.teams'),
  hasTeam: Ember.computed.notEmpty('teams'),

  sortableTableConfig: {

    filteringIgnoreCase: true,
    messageConfig: {
      searchLabel: "Bouya",
      searchPlaceholder: "Search",
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
      console.log('create a team');
      this.get('model').save()
        .then(() => {
          this.toast.success('everything is ok');
        })
        .catch(() => {
          this.toast.error('An error occured');
        })
    }
  }
});
