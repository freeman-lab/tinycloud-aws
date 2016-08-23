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

## credentials

To actually launch nodes, you must have defined the environmental variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. You can optionally specify an environmental variable `AWS_REGION`, which will default to `us-east-1` if not provided.

## methods

#### `var driver = require('tinycloud-aws')(opts)`

Construct a driver with the provided options. The only required option is `key`, the name of the AWS key pair you want to use for deployments. Additional options are

- `image` the amazon image to use, default `ami-d05e75b8` a basic Ubuntu 14.04 image
- `type` the type of instance, deafult `m3.medium`
- `name` a name to tag the instance with, default random
- `disk` disk size, default `8gb`
- `dry`, whether to perform a dry run, default `false`
- `group` a security group to use, default `tinycloud`
- `ports` which ports to open, default `[88, 20]`

#### `driver.start(cb)`

Start the node with the specified options. If an existing node is found that is `stopped`, it will restart it, and call the callback with the updated node description. If no existing node is found, one will be created, and if it is succesfully created, it will call the callback with the description. If the node has already been started, this will do nothing, and call the callback with `null`. Otherwise, any error will be returned.

#### `driver.stop(cb)`

Stop the node. If the node is already running, this will stop it, and call the callback with the updated node description. If the node is already `stopping` or `stopped`, this will do nothing, and call the callback with `null`.

#### `driver.desribe(cb)`

Provide information about the node. The callback will be passed an object with the following fields

- `id` a unique ID for the node
- `private` private IP address of the node
- `public` public IP address of the node
- `dns` public DNS address of the node
- `uptime` time since the node was last started
- `status` status of the node `pending` `running` `stopping` `stopped` `shutting-down` `terminated`

#### `driver.destroy(cb)`

Destructively destroy the node. If the node is succesfully destroyed, it will call the callback with the node description. If the node cannot be found, this will return an error.

## todo

- Add a `login` method
