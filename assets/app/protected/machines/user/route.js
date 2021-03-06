import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, model) {
    controller.set('items', model);
    controller.setData();
  },

  model() {
    let machineIndexController = this.controllerFor('protected.machines.user');
    machineIndexController.set('loadState', true);
    var promise = this.get('store').query('machines/user', {});
      promise.then(() => {
      })
      .catch(() => {
        this.toast.error("Machine list could not be retrieved");
      })
      .finally(() => {
        machineIndexController.set('loadState', false);
      });
    return promise;
  },

  actions : {
    refreshModel() {
      this.store.unloadAll();
      this.refresh();
    },
  }
});
