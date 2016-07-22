import Ember from 'ember';

export default Ember.Route.extend({

  setupController(controller, model) {
    controller.set('items', model);
    controller.setData();
  },
});
