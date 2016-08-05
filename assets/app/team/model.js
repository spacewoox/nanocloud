import DS from 'ember-data';

export default DS.Model.extend({
  idUser: DS.attr('string'),
  name: DS.attr('string'),
});
