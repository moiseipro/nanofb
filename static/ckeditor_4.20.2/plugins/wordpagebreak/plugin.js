/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview The "openlink" plugin.
 *
 */

'use strict';

( function() {
	CKEDITOR.plugins.add('wordpagebreak', {
		icons : 'wordpagebreak',
		init : function(editor) {
	
			var pluginName = 'wordpagebreak';
	
			editor.addCommand(pluginName, {
				exec : function(editor) {
					var html = '<br class="wordpagebreak" clear="all" ' + 
								   'style="mso-special-character: line-break; ' +
										  'page-break-before: always">';
					var element = CKEDITOR.dom.element.createFromHtml(html);
					editor.insertElement(element);
				}
			});
	
			editor.ui.addButton(pluginName, {
				label : 'Word Page Break',
				icon : 'wordpagebreak',
				command : pluginName,
				toolbar : 'insert'
			});
		}
	});
} )();
