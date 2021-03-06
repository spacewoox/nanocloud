import DS from 'ember-data';
import Ember from 'ember';

const TERMINATED = 0;
const INUSE = -1;
const UNASSIGNED = -2;

export default DS.Model.extend({
  name: DS.attr('string'),
  status: DS.attr('string'),
  ip: DS.attr('string'),
  adminPassword: DS.attr('string'),
  platform: DS.attr('string'),
  progress: DS.attr('number'),
  machineSize: DS.attr('string'),
  type: DS.belongsTo('machine-type'),
  driver: DS.belongsTo('machine-driver'),

  isUp: Ember.computed('status', function() {
    return this.get('status') === 'up';
  }),
  isDown: Ember.computed('status', function() {
    return this.get('status') === 'down';
  }),
  isDownloading: Ember.computed('status', function() {
    return this.get('status') === 'creating';
  }),

  getPlatform: Ember.computed('platform', function() {
    switch (this.get('platform')) {
      case "vmwarefusion":
          return "VMware Fusion";
      case "qemu":
          return "Qemu";
      case "manual":
          return "Manual";
      case "aws":
          return "AWS";
      case "openstack":
          return "Openstack";
      default:
          return false;
    }
  }),

  machineName: Ember.computed('name', function() {
    return this.get('name') || "No name";
  }),

  driverDetected: Ember.computed('platform', function() {
    return this.get('getPlatform')? true : false;
  }),
  recording: DS.attr('string', {
    defaultValue: "idle"
  }),
  timeleft: DS.attr('number'),
  countdownTimeleft: Ember.computed.alias('timeleft'),
  users: DS.hasMany('user'),

  formattedTimeleft: Ember.computed('timeleft', function() {
    switch (this.get('timeleft')) {
      case INUSE:
        return "In use";
      case UNASSIGNED:
        return "Unassigned";
      case TERMINATED:
        return "Waiting to be terminated";
      default:
        return "Not supported";
    }
  }),

  shouldEnableLightBulb: Ember.computed('status', function() {
    if (this.get('status') !== 'down') {
      return true;
    }
    return false;
  }),

  displayCountdown: Ember.computed('countdownTimeleft', function() {
    return this.get('countdownTimeleft') > 0 ? true : false;
  }),
});
