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
            "this": 'http://localhost:3000',
            app: app,
            path: '/api/users',
            mongoUrl:  '<mongourl here>',
            SECRET: '<secret here>',
            FACEBOOK_APPID: '<facebook appid here>',
            FACEBOOK_SECRET: '<facebook secret here>',
            FACEBOOK_CALLBACK: '',
            TWITTER_KEY: '<twitter key here>',
            TWITTER_SECRET: '<twitter secret here>',
            TWITTER_CALLBACK: '',
            GOOGLE_APPID: '<google appid here>',
            GOOGLE_SECRET: '<google secret here>',
            GOOGLE_CALLBACK: '',
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

## TODO

- [X] Twitter support
- [X] Google+ support
- [X] Facebook support
- [ ] Linkedin support
- [ ] Linking all accounts together
- [ ] Roles and Permissions (Important!)
- [ ] Security revision (Important!)