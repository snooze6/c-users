c-users
=======

A small library providing user indentification (integrated with facebook and twitter)

## Installation

```sh
  npm install c-users --save
```

## Usage

```js
  var scapegoat = require('scapegoat')
      escape = scapegoat.escape,
      unescape = scapegoat.unescape;

  var html = '<h1>Hello World</h1>',
      escaped = escape(html),
      unescaped = unescape(escaped);

  console.log('html', html, 'escaped', escaped, 'unescaped', unescaped);
```

## Tests

To run the tests simply do

```shell
npm test
```

## Using it for develop

You can do it by using npm link which uses a symbolic link:

```shell
cd <module location>
sudo npm link

# See that it's installed
npm ls --global c-users 

cd <project location>
sudo npm link c-users
```

You can unlink the module with
```shell
cd <project location>
sudo npm unlink c-users
sudo npm rm --global c-users
```