# tinycloud-aws

> cloud driver module for amazon web services

A driver module that implements the driver API for [`tinycloud`](https://github.com/freeman-lab/tinycloud) on amazon web services.

## example

```js
var aws = require('tinycloud-aws')

var instance = aws({
  image: 'ami-d05e75b8',
  type: 'm3.medium',
  name: 'voltron',
  ports: [22, 80],
  key: 'mykey'
})

instance.start(function (err, data) {
  if (err) console.log(err)
  if (data) console.log(data)
})
```

## methods

These are methods implemented by all driver modules.

#### `driver.prepare(cb)`

Run before the instances start, can be used to do things like provision images/disk/networking.

#### `driver.start(cb)`

Start up the node. Idempotent.

#### `driver.stop(cb)`

Stop the node. Idempotent.

#### `driver.desribe(cb)`

Provide information about the node (host/port/uptime)

#### `driver.status(cb)`

Get the status of the node (pending/running/stopped)

#### `driver.destroy(cb)`

Destructively destroy the node.
