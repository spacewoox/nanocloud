import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  createdAt: DS.attr('number'),
  updatedAt: DS.attr('number'),
  members: DS.hasMany(),
  pendingMembers: DS.hasMany(),
  allMembers: Ember.computed('members', 'pendingMembers', function() {
    let user = Ember.A([]);
    this.get('members').forEach((item) => {
      item.isActivated = true;
      user.pushObject(item);
    });
    this.get('pendingMembers').forEach((item) => {
      item.isActivated = false;
      user.pushObject(item);
    });
    return user;
  }),
});
