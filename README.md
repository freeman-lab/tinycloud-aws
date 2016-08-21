# tinycloud-aws

> cloud driver module for amazon web services

A driver module that implements the driver API for [`tinycloud`](https://github.com/freeman-lab/tinycloud) on amazon web services.

## example

```js
var aws = require('tinycloud-aws')

var instance = aws({
  image: 'ami-d05e75b8',
  type: 'm3.medium',
  name: 'tomato',
  key: 'mykey'
})

instance.start(function (err, data) {
  if (err) console.log(err)
  if (data) console.log(data)
})
```

## methods

These are the same methods implemented by all driver modules.

#### `driver.start(cb)`

Start the node with the specified parameters. If the node has already been started, this will do nothing, calling the callback with `null`.

#### `driver.stop(cb)`

Stop the node. If the node has already been stopped, this will do nothing.

#### `driver.desribe(cb)`

Provide information about the node. The callback will be passed an object with the following fields:
- `id` an ID for the node
- `private` the private IP address of the node
- `public` the public IP address of the node
- `dns` the public DNS address of the node
- `status` the state of the node `running` `pending`

#### `driver.status(cb)`

Provide the status of the node. Returns a string `running` `pending`

#### `driver.destroy(cb)`

Destructively destroy the node. If the node cannot be found, this will return an error.
