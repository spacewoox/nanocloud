import Ember from 'ember';

export default Ember.Controller.extend({
  teamController: Ember.inject.controller('protected.users.teams'),
  team: Ember.computed.oneWay('teamController.team'),
  loadState: 0,
  session: Ember.inject.service('session'),
	actions: {
		submitForm() {
      let model = this.get('model');
      this.set('loadState', 1);
      model.set('team', this.get('session.user.team'));
      model.save()
			.then(() => {
				this.toast.success("Mail has been sent.", "Account created");
        this.send('refreshModel');
				Ember.run.later((() => {
					this.transitionToRoute('protected.users.teams');
				}), 0);
			})
			.catch((err) => {
					this.toast.error(err.errors[0].detail, "Account not created");
					return err.responseJSON;
				}
			)
			.finally((err) => {
          this.set('loadState', 0);
				}
			)
		}
	}
});
