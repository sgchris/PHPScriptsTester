Intro
=====
The application allows easily to work on small PHP scripts.
Usually these kind of scripts are used for development, testing or learning purposes.

This application must not (!) be installed on production servers, or any other important servers
that may be exposed to incoming connections

Installation
=======================================

Navigate to a doc root
```
> cd /var/www/html
```

Clone the repo to a folder (e.g. ztest)
```
> git clone https://github.com/sgchris/PHPScriptsTester.git ztest
```

The app is performing I/O operations on files, therefore change permissions of the new folder
```
> chown :www-data ztest
> chmod g+w ztest
```

That's it!. Navigate to the application in your browser
http://localhost/ztest

TODO
====
- [ ] Fix editor PHP highlighting
- [X] When creating new script, select it automatically
- [X] Create "Confirm" and "Prompt" dialogs
- [ ] Initialize editor on the beginning, and once saving ask for a script name
- [X] Add icon to execute the script in another window, and load source by clicking the name itself

Credits
=======

- [CodeMirror](http://codemirror.net) online editor, which is available on [GitHub](https://github.com/codemirror/codemirror)
- [MaterializeCSS](http://materializecss.com/) - CSS framework for material design
- [jQuery](https://jquery.com/) - jQuery JS framework

