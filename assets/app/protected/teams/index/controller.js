import Ember from 'ember';

export default Ember.Controller.extend({

  store: Ember.inject.service('store'),
  session: Ember.inject.service('session'),
  teamName: '',
  modelIsEmpty: Ember.computed.empty('items'),
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

  data : Ember.computed('model', 'items', function() {
    return this.setData();
  }),

  setData: function() {
    if (!this.get('items')) {
      return;
    }
    var ret = Ember.A([]);
    this.get('items').forEach(function(item) {
      ret.push(Ember.Object.create({
        name: item.get('name'),
      }));
    });
    this.set('data', ret);
    return ret;
  },

  columns: function() {

    return [
        {
          "propertyName": "name",
          "title": "Name",
          "disableFiltering": true,
          "filterWithSelect": false,
          "disableSorting": true,
        },
    ];
  }.property(),

  actions: {

    createTeam() {

      let record = this.get('store').createRecord('team', {
        idUser: this.get('session.user.id'),
        name : this.get('teamName'),
      });

      record.save();
    }
  }
});
