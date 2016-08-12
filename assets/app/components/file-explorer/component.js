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

export default Ember.Component.extend({
  isVisible: false,
  publishError: false,

  files: Ember.computed(function() {
    return (this.get('model'));
  }),

  becameVisible: function() {
    this.set('history', [ "Root" ]);
    this.set('history_offset', 0);
    this.set('selectedFile', null);
  },

  selectFile(file) {
    if (this.get('selectedFile') !== file) {
      this.set('selectedFile', file);
    }
    else {
      this.set('selectedFile', null);
    }
  },

  selectDir(dir) {
    this.incrementProperty('history_offset');
    this.goToDirectory(dir);
  },

  goToDirectory(folder) {
    this.get('history').pushObject(folder);
  },

  goBack() {
    if (this.get('history_offset') <= 0) {
      return;
    }
    this.decrementProperty('history_offset');
  },

  goNext() {
    if ((this.get('history_offset')+1) >= this.get('history').length) {
      return;
    }
    this.incrementProperty('history_offset');
  },

  pathToString: Ember.computed('history', 'history_offset', function() {
    var data = this.get('history');
    var offset = this.get('history_offset');
    var path = "";
    for (var i = 0; i <= offset; i++) {
      path += data[i] + "\\";
    }
    return (path);
  }),

  publishSelectedFile() {
  },

  selectedFilePath: Ember.computed('pathToString', 'selectedFile', function() {
    return (this.get('pathToString') + this.get('selectedFile').get('name'));
  }),

  actions: {

    moveOffset(offset) {
      this.set('history_offset', offset);
    },

    toggleFileExplorer() {
      this.toggleProperty('isVisible');
    },

    clickItem(item) {
      console.log('click item');
      this.selectFile(item);
    },

    clickPublish() {
      this.publishSelectedFile();
    },

    clickNextBtn() {
      this.goNext();
    },

    clickPrevBtn() {
      this.goBack();
    },

    clickPath(index) {
      this.get('clickOnPath')(index);
    }
  }
});
