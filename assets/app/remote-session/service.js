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

/* global Guacamole */

export default Ember.Service.extend(Ember.Evented, {
  STATE_IDLE: 0,
  STATE_WAITING: 2,
  STATE_CONNECTED: 3,
  STATE_DISCONNECTED: 5,

  session: Ember.inject.service('session'),
  guacamole: null,
  openedGuacSession: Ember.Object.create({}),
  plazaHasFinishedLoading: false,
  guacToken: Ember.computed('session', 'session.access_token', function() {
    return Ember.$.post(config.GUACAMOLE_URL + 'api/tokens', {
      access_token: this.get('session.access_token')
    });
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

  keyboardAttach(name) {

    var session = this.get('openedGuacSession')[name];
    var guacamole = session.guac;
    var keyboard = session.keyboard;

    if (!keyboard) {
      keyboard = this.get('openedGuacSession')[name].keyboard = new window.Guacamole.Keyboard(document);
    }

    keyboard.onkeydown = function (keysym) {
      guacamole.sendKeyEvent(1, keysym);
    }.bind(this);

    keyboard.onkeyup = function (keysym) {
      guacamole.sendKeyEvent(0, keysym);
    }.bind(this);
  },

  getSession: function(name, width, height) {

    this.set('isError', false);
    this.notifyPropertyChange('guacToken');
    return this.get('guacToken').then((token) => {

      let tunnel = new Guacamole.WebSocketTunnel('/guacamole/websocket-tunnel?' + this._forgeConnectionString(token.authToken, name, width, height));
      let guacamole = new Guacamole.Client(
        tunnel
      );
      this.set('openedGuacSession.' + name, Ember.Object.create({ guac : guacamole }));

      return  {
        tunnel : tunnel,
        guacamole: guacamole,
        status: 0,
      };
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

  pauseInputs(name) {
    if (!this.get('openedGuacSession')[name]) {
      return;
    }
    if (this.get('openedGuacSession')[name].keyboard) {
      this.get('openedGuacSession')[name].keyboard.reset();
      this.get('openedGuacSession')[name].keyboard.onkeyup = null;
      this.get('openedGuacSession')[name].keyboard.onkeydown = null;
      delete this.get('openedGuacSession')[name].keyboard;
    }
  },

  restoreInputs(name) {
    if (this.get('openedGuacSession')[name]) {
      this.keyboardAttach(name);
    }
  },

  setCloudClipboard(name, content) {

    if (this.get('openedGuacSession')[name]) {
      this.set('openedGuacSession.' + name + '.cloudClipboard', content);
      this.get('openedGuacSession')[name].guac.setClipboard(content);
    }
  },

  setLocalClipboard(name, content) {

    if (this.get('openedGuacSession')[name]) {
      this.copyTextToClipboard(content);
      this.set('openedGuacSession.' + name + '.localClipboard', content);
    }
  },

  getCloudClipboard(name) {
    if (this.get('openedGuacSession')[name]) {
      return this.get('openedGuacSession')[name].cloudClipboard;
    }
    return '';
  },

  getLocalClipboard(name) {
    if (this.get('openedGuacSession')[name]) {
      return this.get('openedGuacSession')[name].localClipboard;
    }
    return '';
  },

  disconnectSession(name) {
    this.pauseInputs(name);
    if (this.get('openedGuacSession')[name]) {
      this.get('openedGuacSession')[name].guac.disconnect();
      delete this.get('openedGuacSession')[name];
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

  getWidth: function() {
    return Ember.$(this.element).parent().width();
  },

  getHeight: function() {
    return Ember.$(this.element).parent().height() - 25; // minus topbar height
  },

  startConnection(connectionName) {

    if (Ember.isEmpty(connectionName)) {
      return ;
    }

    let width = this.getWidth();
    let height = this.getHeight();
    let guacSession = this.getSession(connectionName, width, height);

    this.set('guacamole', guacSession);
    guacSession.then((guacData) => {
      guacData.tunnel.onerror = function(status) {
        this.get('element').removeChild(guacData.guacamole.getDisplay().getElement());
        var message = 'Opening a WebSocketTunnel has failed';
        var code = getKeyFromVal(Guacamole.Status.Code, status.code);
        if (code !== -1) {
          message += ' - ' + code;
        }
        this.stateChanged(this.get('STATE_DISCONNECTED'), true, message);
        this.disconnectSession(connectionName);
        this.sendAction('onError', {
          error : true,
          message: 'You have been disconnected due to some error'
        });
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
            this.setCloudClipboard(connectionName, arrayBuffer);
            if (navigator.userAgent.indexOf('Chrome') !== -1) {
              window.postMessage({type: 'VDIExperience', value: arrayBuffer}, '*');
            }
          }.bind(this);
          fileReader.readAsText(blob_reader.getBlob());
        }.bind(this);
      }.bind(this);

      //this.get('element').appendChild(guac.getDisplay().getElement());

      /*
      this.get('remoteSession').keyboardAttach(this.get('connectionName'));
      let mouse = new window.Guacamole.Mouse(guac.getDisplay().getElement());
      */
      let display = guac.getDisplay();
      window.onresize = function() {
        let width = this.getWidth();
        let height = this.getHeight();

        guac.sendSize(width, height);
      }.bind(this);

      /*
      mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = function(mouseState) {
        guac.sendMouseState(mouseState);
      }.bind(this);

      display.oncursor = function(canvas, x, y) {
        display.showCursor(!mouse.setCursor(canvas, x, y));
      };
      */

      guac.connect();
    });
  },

  switchScreen(connectionName, element) {
    let guacSession = this.get('openedGuacSession')[connectionName];
    //this.get('element').appendChild(guac.getDisplay().getElement());
    element.appendChild(guacSession.guac.getDisplay().getElement());
  }
});
