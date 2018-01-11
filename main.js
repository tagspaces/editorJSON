/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals JSONEditor, marked */

'use strict';

sendMessageToHost({ command: 'loadDefaultTextContent' });

var jsonEditor;
var isViewer = true;
var filePath;

$(document).ready(function() {
  var locale = getParameterByName('locale');
  initI18N(locale, 'ns.editorJSON.json');

  var extSettings;
  loadExtSettings();

  $('#markdownHelpModal').on('show.bs.modal', function() {
    $.ajax({
      url: 'libs/jsoneditor/docs/shortcut_keys.md',
      type: 'GET'
    })
      .done(function(jsonData) {
        //console.log('DATA: ' + mdData);
        if (marked) {
          var modalBody = $('#markdownHelpModal .modal-body');
          modalBody.html(marked(jsonData, { sanitize: true }));
          handleLinks(modalBody);
        } else {
          console.log('markdown to html transformer not found');
        }
      })
      .fail(function(data) {
        console.warn('Loading file failed ' + data);
      });
  });

  function handleLinks($element) {
    $element.find('a[href]').each(function() {
      var currentSrc = $(this).attr('href');
      $(this).bind('click', function(e) {
        e.preventDefault();
        sendMessageToHost({ command: 'openLinkExternally', link: currentSrc });
      });
    });
  }

  $('#jsonHelpButton').on('click', function(e) {
    $('#markdownHelpModal').modal({ show: true });
  });

  // Init internationalization
  i18next.init(
    {
      ns: { namespaces: ['ns.editorJSON'] },
      debug: true,
      lng: locale,
      fallbackLng: 'en_US'
    },
    function() {
      jqueryI18next.init(i18next, $);
      $('[data-i18n]').localize();
    }
  );

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerJSONSettings'));
  }
});

function contentChanged() {
  sendMessageToHost({ command: 'contentChangedInEditor', filepath: filePath });
}

function getContent() {
  if (jsonEditor) {
    return JSON.stringify(jsonEditor.get());
  }
}

function setContent(jsonContent, filePath, isViewMode) {
  var UTF8_BOM = '\ufeff';

  if (jsonContent.indexOf(UTF8_BOM) === 0) {
    jsonContent = jsonContent.substring(1, jsonContent.length);
  }

  filePath = filePath;
  try {
    jsonContent = JSON.parse(jsonContent);
  } catch (e) {
    console.log('Error parsing JSON document. ' + e);
    return false;
  }

  var options = {
    search: true,
    history: true,
    mode: isViewer ? 'view' : 'tree',
    //modes: ['code' , 'form' , 'text' , 'tree' , 'view'] , // allowed modes
    onError: function(err) {
      alert(err.toString());
    },
    onChange: contentChanged
  };

  var container = document.getElementById('jsonEditor');

  if (
    !!Object.keys(jsonContent) &&
    (typeof jsonContent !== 'function' || jsonContent === null)
  ) {
    //console.debug(Object.keys(jsonContent));
    jsonEditor = new JSONEditor(container, options, jsonContent);
  } else {
    throw new TypeError('Object.keys called on non-object');
  }

  viewerMode(isViewMode);
}

function viewerMode(isViewerMode) {
  isViewer = isViewerMode;
  if (isViewerMode) {
    jsonEditor.setMode('view');
  } else {
    jsonEditor.setMode('tree');
  }
}
