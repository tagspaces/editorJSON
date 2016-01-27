/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading editorJSON");

  var extensionID = "editorJSON"; // ID should be equal to the directory name where the ext. is located
  var extensionSupportedFileTypes = ["json"];

  var TSCORE = require("tscore");

  var jsonEditor;

  var extensionsPath = TSCORE.Config.getExtensionPath();

  var extensionDirectory = extensionsPath + "/" + extensionID;

  var currentContent;
  var currentFilePath;

  function init(filePath, containerElementID, isViewer) {
    console.log("Initalization JSON Editor...");
    currentFilePath = filePath;
    require([
      extensionDirectory + '/libs/jsoneditor/dist/jsoneditor.min.js',
      'css!' + extensionDirectory + '/libs/jsoneditor/dist/jsoneditor.css',
      'css!' + extensionDirectory + '/extension.css'
    ], function(JSONEditor) {
      $("#" + containerElementID)
        .css("background-color", "white")
        .append('<div id="jsonEditor"></div>');
      var options = {
        mode: isViewer ? 'view' : 'tree',
        change: contentChanged
      };
      jsonEditor = new JSONEditor(document.getElementById("jsonEditor"), options);
      TSCORE.IO.loadTextFilePromise(filePath).then(function(content) {
        exports.setContent(content);
      }, function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Loading " + filePath + " failed.");
        console.error("Loading file " + filePath + " failed " + error);
      });
    });
  };

  function contentChanged() {

    TSCORE.FileOpener.setFileChanged(true);
  }

  function setFileType(fileType) {

    console.log("setFileType not supported on this extension");
  };

  function viewerMode(isViewerMode) {
    if (isViewerMode) {
      jsonEditor.setMode('view');
    } else {
      jsonEditor.setMode('tree');
    }
  };

  function setContent(content) {
    var jsonContent;

    var UTF8_BOM = "\ufeff";
    if (content.indexOf(UTF8_BOM) === 0) {
      content = content.substring(1, content.length);
    }

    try {
      jsonContent = JSON.parse(content);
    } catch (e) {
      console.log("Error parsing JSON document. " + e);
      TSCORE.FileOpener.closeFile(true);
      TSCORE.showAlertDialog("Error parsing JSON document");
      return false;
    }
    //console.log("Content: "+JSON.stringify(jsonConten));
    jsonEditor.set(jsonContent);
    //jsonEditor.expandAll();
  };

  function getContent() {

    return JSON.stringify(jsonEditor.get());
  };

  exports.init = init;
  exports.getContent = getContent;
  exports.setContent = setContent;
  exports.viewerMode = viewerMode;
  exports.setFileType = setFileType;

});
