var util = require('util')
var async = require('async')
var events = require('events')
var client = require('./lib/client')
var noop = function () {}

util.inherits(Driver, events.EventEmitter)

function Driver (opts) {
  if (!(this instanceof Driver)) return new Driver(opts)
  opts = opts || {}
  var self = this

  opts.size = opts.size || 8
  opts.dry = opts.dry || false
  opts.image = opts.image || 'ami-d05e75b8'
  opts.type = opts.type || 'm3.medium'

  if (!opts.key) {
    throw Error('must provide key name')
  }

  self.spec = {
    DryRun: opts.dry,
    ImageId: opts.image,
    InstanceType: opts.type,
    KeyName: opts.key,
    MinCount: 1,
    MaxCount: 1,
    BlockDeviceMappings: [{
      DeviceName: '/dev/sda1',
      Ebs: {DeleteOnTermination: true, VolumeSize: opts.size}
    }]
  }

  self.name = opts.name
  self.client = client()
}

Driver.prototype.start = function (cb) {
  if (!cb) cb = noop
  var self = this
  self.emit('status', 'Starting instance')

  // add check that it's not already running

  async.waterfall([
    function (flow) {
      self.client.runInstances(self.spec, function (err, reserved) {
        if (err) return flow(err)
        flow(null, reserved)
      })
    },
    function (reserved, flow) {
      var params = {
        Resources: [reserved.Instances[0].InstanceId],
        Tags: [{Key: 'Name', Value: self.name}]
      }
      self.client.createTags(params, function (err, data) {
        if (err) return flow(err)
        flow(null, reserved)
      })
    }
  ], function (err, reserved) {
    if (err) return cb(err)
    cb(null, reserved)
  })
}

Driver.prototype.destroy = function (cb) {
  if (!cb) cb = noop
  var self = this

  self.describe(function (err, res) {
    if (err) return cb(err)
    if (res.state == 'running' || res.state == 'pending') {
        var ids = {InstanceIds: [res.id]}
        self.client.terminateInstances(ids, function (err, data) {
        if (err) return cb(err)
        cb(null, res.id)
      })
    }
  })
}

Driver.prototype.describe = function (cb) {
  if (!cb) cb = noop
  var self = this

  var filt = {Filters: [
      {Name: 'tag:Name', Values: [self.name]}
    ]
  }

  this.client.describeInstances(filt, function (err, data) {
    if (err) return cb(err)
    if (data.Reservations[0].length == 0) return cb('no instances found')
    var instance = data.Reservations[0].Instances[0]
    var info = {
      id: instance.InstanceId,
      private: instance.PrivateIpAddress,
      public: instance.PublicIpAddress,
      dns: instance.PublicDnsName,
      state: instance.State.Name
    }
    return cb(null, info) 
  })
}

module.exports = Driver