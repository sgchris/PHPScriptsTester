(function() {
	
	// current selected script name on the files list on the left
	var selectedScriptName = null;
	
	var error = function(str) {
		Materialize && Materialize.toast('ERROR! ' + str, 4000, 'red accent-2');
	}
	
	var notify = function(str) {
		Materialize && Materialize.toast(str, 2000, 'teal');
	};

	var createNewScript = function(scrName) {
		return $.ajax({
			type: 'get',
			url: 'api.php?op=create_script&name='+scrName,
			success: function(res) {
				if (res === 'OK') {
					loadFilesList();
				} else {
					error(res);
				}
			},
			error: function() {
				error('Creating new script failed');
			}
		});
	};

	var addNewScriptToList = function(scrName) {
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
	}

	var loadFilesList = function() {
		return $.ajax({
			type: 'get',
			url: 'api.php?op=list_scripts',
			success: function(res) {
				try {
					var filesList = JSON.parse(res);
				} catch(e) {
					error('ERROR: ' + res);
					return;
				}

				$('ul#files-list li.collection-header').nextAll().remove();

				// fill the list with the existing scripts
				if (filesList.length > 0) {
					filesList.forEach(function(scrName) {
						addNewScriptToList(scrName);
					});
				} else {
					var newLi = $('<li>')
						.addClass('collection-item')
						.text('No scripts :(');

					$('#files-list').append(newLi);
				}
			},
			error: function() {
				error('error loading list of scripts');
			}
		});
	};

	var codeMirror = {
		obj: null,
		init: function() {
			if (!codeMirror.obj) {
				// initialize the codemirror object
				codeMirror.obj = CodeMirror($('#file-content').get(0), {
					lineNumbers: true,
					mode: "htmlmixed",
					extraKeys: {
						'Ctrl-S': saveScriptContent
					}
					//saveFunction: saveScriptContent
				});
				codeMirror.obj.setSize('100%', '100%');
			}
		},
		setContent: function(content) {
			codeMirror.init();
			codeMirror.obj.setValue(content);
		}, 
		getContent: function() {
			codeMirror.init();
			return codeMirror.obj.getValue();
		}
	};

	var loadScriptContent = function(scrName) {
		return $.ajax({
			type: 'get',
			url: 'api.php?op=get_script&name='+scrName,
			success: function(res) {
				// update the editor
				codeMirror.setContent(res);
				
				// set the currently selected script name
				selectedScriptName = scrName;
				
				// enable the save button
				$('#save-file-content-btn').removeClass('disabled');
				
				notify('Script content loaded successfully');
			},
			error: function() {
				error('Cannot load script ' + scrName);
			}
		});
	}
	
	var saveScriptContent = function() {
		
		if (!selectedScriptName) {
			error('No script is selected');
			return;
		}
		
		$('#save-file-content-btn').addClass('disabled');
		
		return $.ajax({
			type: 'post',
			url: 'api.php?op=update_script&name='+selectedScriptName,
			data: {
				content: codeMirror.getContent()
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
	
	var renameScript = function(scrName, newScrName) {
		
		return $.ajax({
			type: 'get',
			url: 'api.php?op=rename_script&name='+scrName+'&new_name='+newScrName,
			success: function(res) {
				if (res === 'OK') {
					// update the list
					loadFilesList();
					
					notify('Renamed successfully');
					
					// load the new content to the editor
					loadScriptContent(newScrName);
				} else {
					error(res);
				}
			},
			error: function() {
				error('Cannot load script ' + scrName);
			}
		});
	}
	
	var deleteScript = function(scrName) {
		
		return $.ajax({
			type: 'get',
			url: 'api.php?op=delete_script&name='+scrName,
			success: function(res) {
				if (res === 'OK') {
					// update the list
					loadFilesList();
					
					notify('Deleted successfully');
				} else {
					error(res);
				}
			},
			error: function() {
				error('Cannot load script ' + scrName);
			}
		});
	}
	
	var fixHeights = function() {
		var height = parseInt($(window).height()) - 200;
		$('#file-content').css('height', height + 'px');
	}

	$(function() {

		// get list of scripts from the server
		loadFilesList();

		// add new script callback
		$('#new-script-name-form').on('submit', function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			
			var val = $('#new-script-name').val().trim();
			if (val) {
				createNewScript(val).always(function() {
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
					loadScriptContent(scriptName);
				}
			})
			.on('click', '.rename-script', function() {
				// get the script name to delete
				var scriptName = $(this).attr('script-name');
				
				var newName = prompt('New script name', scriptName);
				if (!newName) {
					return;
				}
				
				renameScript(scriptName, newName);
				
			})
			.on('click', '.delete-script', function() {
				if (!confirm('sure?')) {
					return;
				}
				
				// get the script name to delete
				var scriptName = $(this).attr('script-name');
				
				deleteScript(scriptName);
				
			});
		
		
		$('#save-file-content-btn').on('click', saveScriptContent);
		
		// initialize the model object
		$('.modal-trigger').leanModal();
		
		// fix heights
		fixHeights();
		$(window).on('resize', fixHeights);

	});

}());
