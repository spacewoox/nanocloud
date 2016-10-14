/**
 * Nanocloud turns any traditional software into a cloud solution, without
 * changing or redeveloping existing source code.
 *
 * Copyright (C) 2016 Nanocloud Software
 *
 * This file is part of Nanocloud.
 *
 * Nanocloud is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Nanocloud is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General
 * Public License
 * along with this program.  If not, see
 * <http://www.gnu.org/licenses/>.
 */

import Ember from 'ember';
import config from 'nanocloud/config/environment';
import getKeyFromVal from 'nanocloud/utils/get-key-from-value';

/* global Guacamole */
/* global $:false */


export default Ember.Service.extend(Ember.Evented, {
  STATE_IDLE: 0,
  STATE_WAITING: 2,
  STATE_CONNECTED: 3,
  STATE_DISCONNECTED: 5,

  session: Ember.inject.service('session'),
  openedGuacSession: Ember.Object.create({}),
  guacToken: Ember.computed('session', 'session.access_token', function() {
    return Ember.$.post(config.GUACAMOLE_URL + 'api/tokens', {
      access_token: this.get('session.access_token')
    });
  }),
  vdiContainer: Ember.computed(function() {
    return Ember.$('.vdiContainer')[0] || null;
  }),
  width: Ember.computed(function() {
    return $(window).width();
  }),
  height: Ember.computed(function() {
    return $(window).height() - 25;
  }),

  _forgeConnectionString: function(token, connectionName, width, height) {

    // Calculate optimal width/height for display
    var pixel_density = Ember.$(this.get('element')).devicePixelRatio || 1;
    var optimal_dpi = pixel_density * 96;
    var optimal_width = width * pixel_density;
    var optimal_height = height * pixel_density;

    // Build base connect string
    var connectString =
        'token='             + token +
        '&GUAC_DATA_SOURCE=' + 'noauthlogged' +
        '&GUAC_ID='          + connectionName +
        '&GUAC_TYPE='        + 'c' + // connection
        '&GUAC_WIDTH='       + Math.floor(optimal_width) +
        '&GUAC_HEIGHT='      + Math.floor(optimal_height) +
        '&GUAC_DPI='         + Math.floor(optimal_dpi);

    // Add audio mimetypes to connect string
    connectString += '&GUAC_AUDIO=' + 'audio%2Fwav';

    // Add video mimetypes to connect string
    connectString += '&GUAC_VIDEO=' + 'video%2Fmp4';

    return connectString;
  },

  keyboardAttach(connectionName) {

    let guacSession = this.get('openedGuacSession')[connectionName];
    var guacamole = guacSession.guacamole;
    var keyboard = guacSession.keyboard;

    if (!keyboard) {
      keyboard = this.get('openedGuacSession')[connectionName].keyboard = new window.Guacamole.Keyboard(document);
    }

    keyboard.onkeydown = function (keysym) {
      guacamole.sendKeyEvent(1, keysym);
    }.bind(this);

    keyboard.onkeyup = function (keysym) {
      guacamole.sendKeyEvent(0, keysym);
    }.bind(this);
  },

  getSession: function(connectionName) {

    this.set('isError', false);
    this.notifyPropertyChange('guacToken');
    return this.get('guacToken').then((token) => {

      let tunnel = new Guacamole.WebSocketTunnel('/guacamole/websocket-tunnel?' + this._forgeConnectionString(token.authToken, connectionName, this.get('width'), this.get('height')));
      let guacamole = new Guacamole.Client(
        tunnel
      );
      let guacSession = {
        guacamole: guacamole,
        tunnel: tunnel,
      };
      this.set('openedGuacSession.' + connectionName, Ember.Object.create(guacSession));
      return guacSession;
    }, () => {
      this.stateChanged(this.get('STATE_DISCONNECTED'), true, 'Could not authenticate session');
    });
  },

  copyTextToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  },

  pauseInputs(connectionName) {
    if (!this.get('openedGuacSession')[connectionName]) {
      return;
    }
    if (this.get('openedGuacSession')[connectionName].keyboard) {
      this.get('openedGuacSession')[connectionName].keyboard.reset();
      this.get('openedGuacSession')[connectionName].keyboard.onkeyup = null;
      this.get('openedGuacSession')[connectionName].keyboard.onkeydown = null;
      delete this.get('openedGuacSession')[connectionName].keyboard;
    }
  },

  restoreInputs(connectionName) {
    if (this.get('openedGuacSession')[connectionName]) {
      this.keyboardAttach(connectionName);
    }
  },

  setCloudClipboard(connectionName, content) {

    if (this.get('openedGuacSession')[connectionName]) {
      this.set('openedGuacSession.' + connectionName + '.cloudClipboard', content);
      this.get('openedGuacSession')[connectionName].guacamole.setClipboard(content);
    }
  },

  setLocalClipboard(connectionName, content) {

    if (this.get('openedGuacSession')[connectionName]) {
      this.copyTextToClipboard(content);
      this.set('openedGuacSession.' + connectionName + '.localClipboard', content);
    }
  },

  disconnectSession(connectionName) {
    this.pauseInputs(connectionName);
    if (this.get('openedGuacSession')[connectionName]) {
      this.get('openedGuacSession')[connectionName].guacamole.disconnect();
      delete this.get('openedGuacSession')[connectionName];
    }
  },

  resetState(){
    this.set('loadState', this.get('STATE_IDLE'));
  },

  stateChanged(state, isError, errorMessage) {
    if (isError) {
      this.set('isError', true);
    }
    if (errorMessage) {
      this.set('errorMessage', errorMessage);
    }
    this.set('loadState', state);
    if (state === this.get('STATE_CONNECTED')) {
      this.trigger('connected');
    }
  },

  startConnection(connectionName) {

    if (Ember.isEmpty(connectionName)) {
      return ;
    }

    let width = this.get('width');
    let height = this.get('height');
    let guacSession = this.getSession(connectionName, width, height);

    return guacSession.then((guacData) => {
      guacData.tunnel.onerror = function(status) {
        this.get('vdiContainer').removeChild(guacData.guacamole.getDisplay().getElement());
        var message = 'Opening a WebSocketTunnel has failed';
        var code = getKeyFromVal(Guacamole.Status.Code, status.code);
        if (code !== -1) {
          message += ' - ' + code;
        }
        this.stateChanged(this.get('remoteSession.STATE_DISCONNECTED'), true, message);
        this.disconnectSession(this.get('connectionName'));
      }.bind(this);
      let guac = guacData.guacamole;

      guac.onfile = function(stream, mimetype, filename) {
        let blob_reader = new Guacamole.BlobReader(stream, mimetype);

        blob_reader.onprogress = function() {
          stream.sendAck('Received', Guacamole.Status.Code.SUCCESS);
        }.bind(this);

        blob_reader.onend = function() {
          //Download file in browser
          var element = document.createElement('a');
          element.setAttribute('href', window.URL.createObjectURL(blob_reader.getBlob()));
          element.setAttribute('download', filename);
          element.style.display = 'none';
          document.body.appendChild(element);

          element.click();

          document.body.removeChild(element);
        }.bind(this);

        stream.sendAck('Ready', Guacamole.Status.Code.SUCCESS);
      }.bind(this);

      guac.onstatechange = (state) => {
        this.stateChanged(state);
      };

      guac.onclipboard = function(stream, mimetype) {

        let blob_reader = new Guacamole.BlobReader(stream, mimetype);
        blob_reader.onprogress = function() {
          stream.sendAck('Received', Guacamole.Status.Code.SUCCESS);
        }.bind(this);

        blob_reader.onend = function() {
          var arrayBuffer;
          var fileReader = new FileReader();
          fileReader.onload = function(e) {
            arrayBuffer = e.target.result;
            this.setCloudClipboard(this.get('connectionName'), arrayBuffer);
            if (navigator.userAgent.indexOf('Chrome') !== -1) {
              window.postMessage({type: 'VDIExperience', value: arrayBuffer}, '*');
            }
          }.bind(this);
          fileReader.readAsText(blob_reader.getBlob());
        }.bind(this);
      }.bind(this);

      guac.connect();
    });
  },

  attachInputs(connectionName) {
    let guacSession = this.get('openedGuacSession')[connectionName];
    this.keyboardAttach(connectionName);
    let mouse = new window.Guacamole.Mouse(guacSession.guacamole.getDisplay().getElement());
    let display = guacSession.guacamole.getDisplay();
    window.onresize = function() {
      let width = this.get('width');
      let height = this.get('height');
      guacSession.guacamole.sendSize(width, height);
    }.bind(this);

    mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = function(mouseState) {
      guacSession.guacamole.sendMouseState(mouseState);
    }.bind(this);

    display.oncursor = function(canvas, x, y) {
      display.showCursor(!mouse.setCursor(canvas, x, y));
    };
  },

  switchScreen(connectionName) {
    let guacSession = this.get('openedGuacSession')[connectionName];
    if (guacSession) {
      this.attachInputs(connectionName);
      this.get('vdiContainer').appendChild(guacSession.guacamole.getDisplay().getElement());
    }
  }
});
