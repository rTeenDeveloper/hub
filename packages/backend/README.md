# What the hell is this
Community hub backend

# How do I make it work
Community hub backend requries one additional setup step - setting up your config files. Take a look at config/development folder, most parameters are self-explanatory :)

# The src folder structure is fucking weird, bruh!
```
├── api
│   └── 1
│       ├── apiConfiguration.js
│       └── handlers
│           └── basically home of all API routes
├── helpers
│   └── various helpers
├── index.js
├── routes
│   └── __test__
├── schema
│   └── User.js
├── server.js
└── testFixtures
    └── index.js
```

The `api` folder is a home to all API versions.

1 - api v1
2 - api v2, etc, you got the idea.

Each API version __MUST__ have:
* An _optional_ apiConfiguration.js
* A __required__ folder named `handlers`
* Each JS file in `handlers`, except tests, is a separate API endpoint. Files are found recursively and mounted at /api/vAPI_VERSION/filePathRelativeToHandlers.
* Each JS file in `handlers` must use legacy export format (with module.exports), exporting __express.Router()__ instance

apiConfiguration.js exports an object of the following format:
```js
module.exports = {
    deleted: []
}
```
The array consists either of regexes or strings, which tell what API methods are not inherited from previous version


A couple examples to illustrate:

Assume you have following file structure:
```
└── api
    └── 1
        ├── apiConfiguration.js
        └── handlers
           └── requests
               └── accept.js
```
So the API URL for it is going to be `/api/v1/requests/accept`

# On "routes" folder
Well, we use routes when we need to basically override some methods at the API for example or when we should add some routes that are not covered by API routing scheme, like `/do/something/pls`

Writing them is actually the same as you write API handlers.
For example, if you want route `/do/something/pls`, you create the following structure in routes:
```
└── do
    └── something
        └── pls.js
```
