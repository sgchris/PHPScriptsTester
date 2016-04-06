<?php


// get the files list - files starting with 'test_' ending with '.php'
$filesList = array_filter(scandir($scriptsFolder), function($name) {
	if ($name == '.' || $name == '..') {
		return false;
	}

	if (!preg_match('%^test_.*\.php$%i', $name)) {
		return false;
	}
	// return
	return true;
});

usort($filesList, function($a, $b) use ($scriptsFolder) {
	// get the modification date
	$mtimeA = filemtime($scriptsFolder.DS.$a);
	$mtimeB = filemtime($scriptsFolder.DS.$b);

	return $mtimeA > $mtimeB ? 1 : ($mtimeA == $mtimeB ? 0 : -1);
});

ret(array_values($filesList));

