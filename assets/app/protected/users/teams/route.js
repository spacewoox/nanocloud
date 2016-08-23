import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, model) {
    controller.set('teams', model);
  },

  model() {
    return this.store.queryRecord('team', {});
  },

	actions: {
		refreshTeamsData() {
			this.refresh();
		}
	}
});
