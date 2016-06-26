c-users
=======

A small library providing user indentification (integrated with facebook and twitter)

## Installation

```sh
  npm install c-users --save
```

## Usage

```js
    require('c-users').setup(
        {
            app: app,
            path: '/api/users',
            mongoUrl:  'mongodb://admin:admin@ds017584.mlab.com:17584/users-test',
            SECRET: 'secret',
            FACEBOOK_APPID: '1758185061124198',
            FACEBOOK_SECRET: '8300b6843b6c5bfa195ad80771723e1f',
            TWITTER_KEY: 'CuLAddt5dRbJucvURg832taHt',
            TWITTER_SECRET: 'Xa4FpPxYkEbgngbOraF9Hu6DEReHhzw33yjQ2JHk5hft7rMiRQ',
            verbose: true,
            tag: '[DEBUG] -- '
        }
    );
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