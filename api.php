<?php

define('DS', DIRECTORY_SEPARATOR);

if (!isset($_GET['op'])) {
	ret('OP is not defined');
}
$op = $_GET['op'];

// check the scripts folder
if (!is_dir(__DIR__.DS.'scripts')) {
	if (!is_writeable(__DIR__)) {
		ret('no "scripts" folder, and permissions to create one');
	}

	if (!@mkdir(__DIR__.DS.'scripts')) {
		ret('cannot create "scripts" folder');
	}
}

$scriptsFolder = __DIR__.DS.'scripts';
if (!is_writeable($scriptsFolder)) {
	ret('no write permissions to '.$scriptsFolder);
}

$opsWithoutNameRequirement = ['list_scripts'];

// receive the name
if (!in_array($op, $opsWithoutNameRequirement)) {
	if (!isset($_GET['name'])) {
		ret('name is not defined');
	}

	$name = $_GET['name'];
	sanitizeScriptName($name);

	$filePath = $scriptsFolder.DS.$name;
}

switch ($op) {
	case 'list_scripts':
		// get the files list - files starting with 'test_' ending with '.php'
		$filesList = array_filter(scandir($scriptsFolder), function($name) {
			if ($name == '.' || $name == '..') {
				return false;
			}

			if (!preg_match('%^test_.*\.php$%i', $name)) {
				return false;
			}

			return true;
		});

		usort($filesList, function($a, $b) use ($scriptsFolder) {
			// get the modification date
			$mtimeA = filemtime($scriptsFolder.DS.$a);
			$mtimeB = filemtime($scriptsFolder.DS.$b);

			return $mtimeA > $mtimeB ? 1 : ($mtimeA == $mtimeB ? 0 : -1);
		});

		ret(array_values($filesList));
		break;
	case 'create_script':
		if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
			ret('must be a POST request. Optionally with `content` parameter');
		}

		if (file_exists($filePath)) {
			ret('file already exists');
		}

		$content = "<?php\r\n";
		if (isset($_POST['content'])) {
			$content = $_POST['content'];
		}

		if (!is_writeable(dirname($filePath))) {
			ret('No write permission to '.$dirname($filePath));
		}

		// create the file
		file_put_contents($filePath, $content);

		break;
	case 'delete_script':
		if (!file_exists($filePath)) {
			ret('file does not exist');
		}

		if (!is_writeable($filePath)) {
			ret('No delete permission of '.$filePath);
		}

		// create the file
		if (!@unlink($filePath)) {
			ret('Could not delete the file');
		}

		break;
	case 'get_script':
		if (!file_exists($filePath)) {
			ret('file does not exist');
		}

		if (!is_readable($filePath)) {
			ret('No read permission of '.$filePath);
		}

		// get the file contents
		echo file_get_contents($filePath);
		exit;
		break;
	case 'update_script':
		if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
			ret('must be a POST request with `content` parameter');
		}

		if (!isset($_POST['content'])) {
			ret('no new content ("content" POST parameter) given');
		}

		$newContent = $_POST['content'];

		if (!file_exists($filePath)) {
			ret('file does not exist');
		}

		if (!is_writeable($filePath)) {
			ret('No update permission to '.$filePath);
		}

		// create the file
		file_put_contents($filePath, $newContent);

		break;
	case 'rename_script':
		if (!file_exists($filePath)) {
			ret('file does not exist');
		}

		if (!isset($_GET['new_name'])) {
			ret('no new name (new_name GET parameter) given');
		}

		$newName = $_GET['new_name'];
		sanitizeScriptName($newName);

		if (!is_writeable($filePath)) {
			ret('No delete permission of '.$filePath);
		}

		// create the file
		$dirName = dirname($filePath);
		if (!@rename($filePath, $dirName . DS . $newName)) {
			ret('Could not rename the file');
		}

		break;
	default:
		ret('unrecognized OP parameter');
		break;
}

echo 'OK';

///////////////// functions ////////////////////

function sanitizeScriptName(&$name) {
	// check prefix
	if (!preg_match('%^test_%i', $name)) {
		$name = "test_{$name}";
	}

	// check suffix
	if (!preg_match('%\.php$%i', $name)) {
		$name = "{$name}.php";
	}
}

function ret($mixed) {
	if (is_array($mixed)) {
		exit(json_encode($mixed));
	}

	exit($mixed);
}


