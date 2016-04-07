(function() {
	
	var error = function(str) {
		Materialize && Materialize.toast('ERROR! ' + str, 4000, 'red accent-2');
	}
	
	var notify = function(str) {
		Materialize && Materialize.toast(str, 2000, 'teal');
	};

	var api = {
		createNewScript: function(scrName) {
			return $.ajax({
				type: 'get',
				url: 'api.php?op=create_script&name='+scrName,
				success: function(res) {
					if (res !== 'OK') {
						error(res);
					}
				},
				error: function() {
					error('Creating new script failed');
				}
			});
		},

		// get the list of the files and update the list
		loadFilesList: function() {
			return $.ajax({
				type: 'get',
				url: 'api.php?op=list_scripts',
				success: function(res) {
					try {
						var list = JSON.parse(res);
					} catch(e) {
						error('ERROR: ' + res);
						return;
					}
				},
				error: function() {
					error('error loading list of scripts');
				}
			});
		},

		loadScriptContent: function(scrName) {
			return $.ajax({
				type: 'get',
				url: 'api.php?op=get_script&name='+scrName,
				success: function(res) {
					// update the editor
					editor.setContent(res);
					
					// enable the save button
					$('#save-file-content-btn').removeClass('disabled');
					
					notify('Script content loaded successfully');
				},
				error: function() {
					error('Cannot load script ' + scrName);
				}
			});
		},

		renameScript: function(scrName, newScrName) {
			return $.ajax({
				type: 'get',
				url: 'api.php?op=rename_script&name='+scrName+'&new_name='+newScrName,
				success: function(res) {
					if (res === 'OK') {
						// update the list
						api.loadFilesList();
						
						notify('Renamed successfully');
					} else {
						error(res);
					}
				},
				error: function() {
					error('Cannot load script ' + scrName);
				}
			});
		},
	
		deleteScript: function(scrName) {
			return $.ajax({
				type: 'get',
				url: 'api.php?op=delete_script&name='+scrName,
				success: function(res) {
					if (res === 'OK') {
						notify('Deleted successfully');
					} else {
						error(res);
					}
				},
				error: function() {
					error('Cannot load script ' + scrName);
				}
			});
		},

		saveContent: function(scriptName) {
			$('#save-file-content-btn').addClass('disabled');
			
			return $.ajax({
				type: 'post',
				url: 'api.php?op=update_script&name='+scriptName,
				data: {
					content: editor.getContent()
				},
				success: function(res) {
					if (res === 'OK') {
						notify('Saved successfully');

						// re-enable the save button
						$('#save-file-content-btn').removeClass('disabled');
					} else {
						error(res);
					}
				},
				error: function() {
					error('Cannot load script ' + scrName);
				}
			});
		}
	};

	var dialog = {
		// display a popup
		// button: {caption, isCancel, callbackFn}
		_show: function(title, content, buttons, initFn) {
			var buttonsHtml = [],
				buttonId;
			if (buttons && buttons.length > 0) {
				buttons.forEach(function(button) {

					// generate button ID
					buttonId = button.caption.replace(/\W+/g, '-');

					// generate button HTML
					buttonsHtml.push(
						'<button type="button" id="dialog-btn-'+buttonId+'" class="waves-effect waves-green btn-flat">'+button.caption+'</button>' 
					);

					// assign a callback in case of a "cancel" button
					if (button.isCancel) {
						button.callbackFn = function() {
							$('#dialog-modal').closeModal();
						};
					}

					// assign click event to the button
					$('body').off('click', '#dialog-modal #dialog-btn-' + buttonId);
					$('body').on('click', '#dialog-modal #dialog-btn-' + buttonId, button.callbackFn);
					$('body').on('click', '#dialog-modal #dialog-btn-' + buttonId, function() {
						$('#dialog-modal').closeModal();
					});
				});
			}

			title = title || 'Dialog Modal';

			var $dialog = $(
				'<div id="dialog-modal" class="modal">' + 
					'<div class="modal-content">' + 
						'<h4>' + title + '</h4>' + 
						'<div>' + content + '</div>' + 
					'</div>' + 
					'<div class="modal-footer">' + 
						buttonsHtml.reverse().join('') +
					'</div>' + 
				'</div>'
			);

			// remove the previous modal
			if ($('#dialog-modal').length) {
				$('#dialog-modal').remove();
			}

			// add the new modal
			$('body').append($dialog);

			// call the initialization function
			if (typeof(initFn) == 'function') {
				initFn($dialog);
			}

			$dialog.openModal();

		},

		confirm: function(title, callbackFn) {
			dialog._show(title, '', [{
				caption: 'Ok', 
				callbackFn: callbackFn
			}, {
				caption: 'Cancel',
				isCancel: true
			}]);
		},

		prompt: function(title, initialValue, inputLabel, placeholder, buttonText, buttonIcon, callbackFn) {
			if (!title) {
				console.warn('`title` was not provided to the prompt dialog');
				title = 'Input';
			}

			// init the parameters
			initialValue = initialValue || '';
			inputLabel = inputLabel || title
			placeholder = placeholder || '';
			buttonText = buttonText || 'Ok';
			buttonIcon = 'send';

			// add the dialog HTML to the page
			var $dialog = $(
				'<div id="dialog-modal" class="modal">' + 
					'<form id="dialog-modal-form">' + 
						'<div class="modal-content">' + 
							'<h4>' + title + '</h4>' + 
							'<div class="row">' + 
								'<div class="input-field col s12">' + 
									'<input type="text" id="dialog-input" placeholder="' + placeholder + '" value="' + initialValue + '" />' + 
									'<label for="dialog-input">' + inputLabel + '</label>' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						'<div class="modal-footer">' + 
							'<button type="button" id="dialog-cancel-btn" class="waves-effect waves-green btn-flat">Cancel</button>' + 
							'<button type="submit" id="dialog-submit-btn" class="waves-effect waves-green btn-flat">' + buttonText + '</button>' + 
						'</div>' + 
					'</form>' + 
				'</div>'
			);

			// remove the previous modal
			if ($('#dialog-modal').length) {
				$('#dialog-modal').remove();
			}

			// add the new modal
			$('body').append($dialog);

			// bind events
			$dialog.find('#dialog-modal-form').on('submit', function(evt) {
				console.log('in the submit');
				evt.preventDefault();

				// get the value of the input
				var val = $('#dialog-input').val().trim();

				// close the dialog
				$dialog.closeModal();

				// trigger the callback
				if (typeof(callbackFn) == 'function') {
					callbackFn(val);
				}
			});

			$dialog.find('#dialog-cancel-btn').on('click', function() {
				// close the dialog
				$dialog.closeModal();

				// trigger the callback
				if (typeof(callbackFn) == 'function') {
					callbackFn('');
				}
			});

			// display the dialog
			$dialog.openModal({
				dismissable: false,
			});
		}
	}

	var filesList = {
		// current selected script name on the files list on the left
		selectedScriptName: null,

		// fix the script name
		sanitizeNewName: function(scriptName) {
			if (!/^test_/i.test(scriptName)) {
				scriptName = 'test_' + scriptName;
			}
			if (!/\.php$/i.test(scriptName)) {
				scriptName = scriptName + '.php';
			}

			return scriptName;
		},

		init: function() {

			// load the current scripts
			filesList.load();

			// add new script button
			$('#add-new-script-btn').on('click', function() {
				var title = 'Create script',
					initialValue = '',
					inputLabel = 'New script name',
					placeholder = '',
					buttonText = 'Create',
					buttonIcon = null;

				dialog.prompt(title, initialValue, inputLabel, placeholder, buttonText, buttonIcon, function(newScriptName) {
					if (newScriptName) {
						filesList.createAndAdd(newScriptName);
					}
				}); });

			// assign events to the list
			$('#files-list-wrapper')
				.on('click', '.load-source-link', function() {
					filesList.selectScript($(this).parents('.collection-item').attr('script-name'));
				})
				.on('click', '.rename-script', function() {
					// get the script name to delete
					var scriptName = $(this).parents('.collection-item').attr('script-name');
					
					var title = 'Rename script',
						initialValue = scriptName,
						inputLabel = 'New script name',
						placeholder = '',
						buttonText = 'Rename',
						buttonIcon = null;

					dialog.prompt(title, initialValue, inputLabel, placeholder, buttonText, buttonIcon, function(newScriptName) {
						console.log('newScriptName', newScriptName);
						if (!newScriptName) {
							return;
						}
						
						filesList.rename(scriptName, newScriptName);
					});
				})
				.on('click', '.delete-script', function() {
					// get the script name to delete
					var scriptName = $(this).parents('.collection-item').attr('script-name');

					dialog.confirm('Delete the script?', function() {
						// delete the file from the hardisk
						filesList.delete(scriptName);
					});
				});

		},
		
		// mark and load a script
		selectScript: function(scrName) {
			// set the selected script
			filesList.selectedScriptName = scrName;
			
			// put the script name near the title
			$('#currently-selected-script').text(' - ' + scrName);

			// unmark currently selected line
			$('#files-list .collection-item').removeClass('active');

			// mark the required script
			$('#files-list .collection-item[script-name="'+scrName+'"]').addClass('active');

			// load the content of the script
			api.loadScriptContent(scrName).then(function() {
				editor.focus();
			});
		},

		// clear the list
		clear: function() {
			$('ul#files-list li.collection-header').nextAll().remove();
		},
	
		// add new file to the list 
		createAndAdd: function(scriptName) {

			// fix the name of the new script
			scriptName = filesList.sanitizeNewName(scriptName);

			// create the file on the server
			api.createNewScript(scriptName).then(function(res) {
				if (res === 'OK') {
					// add to the list
					filesList.add(scriptName);

					// select the new file
					filesList.selectScript(scriptName);
				}
			});
		},

		add: function(scriptName) {
			// create and prepend the new element
			var newLi = $(
				'<li class="collection-item" script-name="' + scriptName + '">' +
				'	<a href="javascript:;" title="Click to edit the script" class="load-source-link">' + scriptName + '</a>' + 
				'	<div class="secondary-content">' + 
				'		<a href="javascript:;" class="delete-script" title="Delete the script">' + 
				'			<i class="material-icons">delete</i>' + 
				'		</a>' + 
				'		<a href="javascript:;" class="rename-script" title="Rename the script">' + 
				'			<i class="material-icons">mode_edit</i>' + 
				'		</a>' + 
				'		<a href="scripts/' + scriptName + '" target="_blank" title="Open the script in a new window">' + 
				'			<i class="material-icons">open_in_new</i>' + 
				'		</a>' + 
				'	</div>' + 
				'</li>'
			).insertAfter($('ul#files-list li.collection-header'));
		},

		rename: function(scriptName, newScriptName) {
			api.renameScript(scriptName, newScriptName).then(function() {
				// update the name in the list
				$('.collection-item[script-name="' + scriptName + '"]')
					.attr('script-name', newScriptName)
					.find('.load-source-link').text(newScriptName);

				// select the new script
				filesList.selectScript(newScriptName);
			});
		},

		delete: function(scriptName) {
			// delete it from the disk
			api.deleteScript(scriptName).then(function(res) {
				if (res === 'OK') {
					// remove the script from the list
					$('.collection-item[script-name="' + scriptName + '"]').remove();
				}
			});
		},

		// populate list
		set: function(list) {
			// clear the list
			filesList.clear();

			// fill the list with the existing scripts
			if (list.length > 0) {
				list.forEach(function(scrName) {
					filesList.add(scrName);
				});
			} else {
				var newLi = $('<li>')
					.addClass('collection-item')
					.text('No scripts :(');

				$('#files-list').append(newLi);
			}
		},

		load: function() {
			api.loadFilesList().then(function(res) {
				try {
					var list = JSON.parse(res);
				} catch(e) {
					return;
				}

				filesList.set(list);
			});
		}

	};

	// the CodeMirror object
	var editor = {
		obj: null,
		init: function() {
			if (!editor._initialized) {
				editor._initialized = true;
			} else {
				return;
			}
			// initialize the codemirror object
			if (!editor.obj) {
				editor.obj = CodeMirror($('#file-content').get(0), {
					lineNumbers: true,
					mode: "htmlmixed",
					extraKeys: {
						'Ctrl-S': editor.saveContent
					}
				});
				editor.obj.setSize('100%', '100%');
			}

			// assign event to the "Save" button
			$('#save-file-content-btn').on('click', editor.saveContent);
		},
		focus: function() {
			editor.obj.focus();
		},
		setContent: function(content) {
			editor.init();
			editor.obj.setValue(content);
		}, 
		getContent: function() {
			editor.init();
			return editor.obj.getValue();
		},
		saveContent: function() {
			//filesList
			if (filesList.selectedScriptName) {
				api.saveContent(filesList.selectedScriptName);
			}
		}
	};
	
	
	
	var fixHeights = function() {
		var height = parseInt($(window).height()) - 200;
		$('#file-content').css('height', height + 'px');
	}

	$(function() {

		// initialize the scripts list - load and assign events
		filesList.init();
	
		// fix heights
		fixHeights();
		$(window).on('resize', fixHeights);

	});

}());
