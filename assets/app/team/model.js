import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  createdAt: DS.attr('number'),
  updatedAt: DS.attr('number'),
  members: DS.attr(),
});
