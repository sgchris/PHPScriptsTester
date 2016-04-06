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
					if (res === 'OK') {
						api.loadFilesList();
					} else {
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

					filesList.set(list);

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
					
					// set the currently selected script name
					filesList.selectedScriptName = scrName;
					
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
						
						// load the new content to the editor
						api.loadScriptContent(newScrName);
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
						// update the list
						api.loadFilesList();
						
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

		saveScriptContent: function() {
			if (!filesList.selectedScriptName) {
				error('No script is selected');
				return;
			}
			
			$('#save-file-content-btn').addClass('disabled');
			
			return $.ajax({
				type: 'post',
				url: 'api.php?op=update_script&name='+filesList.selectedScriptName,
				data: {
					content: editor.getContent()
				},
				success: function(res) {
					if (res === 'OK') {
						notify('Saved successfully');
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

	var filesList = {
		// current selected script name on the files list on the left
		selectedScriptName: null,

		// clear the list
		clear: function() {
			$('ul#files-list li.collection-header').nextAll().remove();
		},
	
		// add new file to the list 
		add: function(scrName) {
			var newLi = $(
				'<li class="collection-item">' +
				'	<a href="scripts/' + scrName + '" target="_blank" title="Execute the script in a separate tab/window">' + scrName + '</a>' + 
				'	<div class="secondary-content">' + 
				'		<a href="javascript:;" script-name="' + scrName + '" class="delete-script" title="Delete the script">' + 
				'			<i class="material-icons">delete</i>' + 
				'		</a>' + 
				'		<a href="javascript:;" script-name="' + scrName + '" class="rename-script" title="Rename the script">' + 
				'			<i class="material-icons">mode_edit</i>' + 
				'		</a>' + 
				'		<a href="javascript:;" script-name="' + scrName + '" class="load-source-link" title="Load the source code">' + 
				'			<i class="material-icons">code</i>' + 
				'		</a>' + 
				'	</div>' + 
				'</li>'
			).insertAfter($('ul#files-list li.collection-header'));
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
		}

	};

	// the CodeMirror object
	var editor = {
		obj: null,
		init: function() {
			if (!editor.obj) {
				// initialize the codemirror object
				editor.obj = CodeMirror($('#file-content').get(0), {
					lineNumbers: true,
					mode: "htmlmixed",
					extraKeys: {
						'Ctrl-S': api.saveScriptContent
					}
				});
				editor.obj.setSize('100%', '100%');
			}
		},
		setContent: function(content) {
			editor.init();
			editor.obj.setValue(content);
		}, 
		getContent: function() {
			editor.init();
			return editor.obj.getValue();
		}
	};
	
	
	
	var fixHeights = function() {
		var height = parseInt($(window).height()) - 200;
		$('#file-content').css('height', height + 'px');
	}

	$(function() {

		// get list of scripts from the server
		api.loadFilesList();

		// add new script callback
		$('#new-script-name-form').on('submit', function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			
			var val = $('#new-script-name').val().trim();
			if (val) {
				api.createNewScript(val).always(function() {
					// close the modal
					$('#add-new-script-modal').closeModal();
				});
			}
		});

		// load the source
		$('#files-list-wrapper')
			.on('click', '.load-source-link', function() {
				// mark the current item
				$('#files-list .collection-item').removeClass('active');
				$(this).parents('.collection-item').addClass('active');

				var scriptName = $(this).attr('script-name');
				if (scriptName) {
					api.loadScriptContent(scriptName);
				}
			})
			.on('click', '.rename-script', function() {
				// get the script name to delete
				var scriptName = $(this).attr('script-name');
				
				var newName = prompt('New script name', scriptName);
				if (!newName) {
					return;
				}
				
				api.renameScript(scriptName, newName);
				
			})
			.on('click', '.delete-script', function() {
				if (!confirm('sure?')) {
					return;
				}
				
				// get the script name to delete
				var scriptName = $(this).attr('script-name');
				
				api.deleteScript(scriptName);
				
			});
		
		
		$('#save-file-content-btn').on('click', api.saveScriptContent);
		
		// initialize the model object
		$('.modal-trigger').leanModal();
		
		// fix heights
		fixHeights();
		$(window).on('resize', fixHeights);

	});

}());
