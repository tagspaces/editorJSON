/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define(function (require, exports, module) {
    "use strict";

    var extensionID = "editorJSON"; // ID should be equal to the directory name where the ext. is located
    var extensionSupportedFileTypes = ["json"];

    console.log("Loading " + extensionID);

    var TSCORE = require("tscore");
    var jsonEditor, containerElID, currentFilePath, $containerElement;
    var extensionsPath = TSCORE.Config.getExtensionPath();
    var JSONEditor;
    var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;

    function init(filePath, containerElementID, isViewer) {
        console.log("Initalization JSON Viewer...");
        containerElID = containerElementID;
        $containerElement = $('#' + containerElID);

        currentFilePath = filePath;
        $containerElement.empty();
        $containerElement.css("background-color", "white");
        $containerElement.append($('<iframe>', {
            sandbox: "allow-same-origin allow-scripts allow-modals",
            id: "iframeViewer",
            "nwdisable": "",
            //"nwfaketop": "",
            "src": extensionDirectory + "/index.html?&locale=" + TSCORE.currentLanguage,
        }));
        TSCORE.IO.loadTextFilePromise(filePath).then(function (content,isViewerMode) {
            exports.setContent(content);
            exports.viewerMode(isViewerMode);
        }, function (error) {
            TSCORE.hideLoadingAnimation();
            TSCORE.showAlertDialog("Loading " + filePath + " failed.");
            console.error("Loading file " + filePath + " failed " + error);
        });
    }

    function contentChanged() {

        TSCORE.FileOpener.setFileChanged(true);
    }

    function setFileType(fileType) {

        console.log("setFileType not supported on this extension");
    }

    function viewerMode(isViewerMode) {
        var jsonContent = isViewerMode;
        console.log('VIEWER MODE:  ' + jsonContent)
        var contentWindow = document.getElementById("iframeViewer").contentWindow;
        if (typeof contentWindow.viewerMode === "function") {
            contentWindow.viewerMode(jsonContent);
        } else {
            window.setTimeout(function () {
                contentWindow.viewerMode(jsonContent);
            }, 500);
           // TSCORE.showAlertDialog("Error viewerMode");
        }
    }

    function setContent(content) {
        var jsonContent;
        var UTF8_BOM = "\ufeff";
        var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);

        if (isWeb) {
            fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(location.href) + "/" + fileDirectory;
        }
        if (content.indexOf(UTF8_BOM) === 0) {
            content = content.substring(1, content.length);
        }
        // console.log(jsonContent);
        //jsonEditor.setContent(jsonContent);
        //jsonEditor.expandAll();
        var contentWindow = document.getElementById("iframeViewer").contentWindow;
        if (typeof contentWindow.setContent === "function") {
            try {
                jsonContent = JSON.parse(content);
            } catch (e) {
                console.log("Error parsing JSON document. " + e);
                TSCORE.FileOpener.closeFile(true);
                TSCORE.showAlertDialog("Error parsing JSON document");
                return false;
            }
            console.log(jsonContent);
            contentWindow.setContent(jsonContent, fileDirectory);
        } else {
            // TODO optimize setTimeout
            window.setTimeout(function () {
                contentWindow.setContent(jsonContent, fileDirectory);
            }, 500);
        }
    }

    function getContent() {

        return JSON.stringify(jsonEditor.get());
    }

    exports.init = init;
    exports.getContent = getContent;
    exports.setContent = setContent;
    exports.viewerMode = viewerMode;
    exports.setFileType = setFileType;

});
