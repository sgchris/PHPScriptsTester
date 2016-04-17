Intro
=====
The application allows easily to work on small PHP scripts.
Usually these kind of scripts are used for development, testing or learning purposes.

This application must not (!) be installed on production servers, or any other important servers
that may be exposed to incoming connections

Screenshot
==========

![PHP scripts tester screenshot](http://online-php.com/images/ztest_screenshot_1.jpg)

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

Credits
=======

- [CodeMirror](http://codemirror.net) online editor, which is available on [GitHub](https://github.com/codemirror/codemirror)
- [MaterializeCSS](http://materializecss.com/) - CSS framework for material design
- [jQuery](https://jquery.com/) - jQuery JS framework

