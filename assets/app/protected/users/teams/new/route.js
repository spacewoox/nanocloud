import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller) {
    controller.set('model', this.store.createRecord('pendinguser'));
  },

	actions: {
		refreshModel() {
      let teamController = this.controllerFor('protected.users.teams');
      teamController.send('refreshTeamsData');
		}
	}
});
