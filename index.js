var async = require('async')
var random = require('random-word')
var client = require('./lib/client')
var noop = function () {}

function Driver (opts) {
  if (!(this instanceof Driver)) return new Driver(opts)
  opts = opts || {}
  var self = this

  opts.disk = opts.disk || 8
  opts.dry = opts.dry || false
  opts.image = opts.image || 'ami-d05e75b8'
  opts.group = opts.group || 'tinycloud'
  opts.ports = [22, 80]
  opts.type = opts.type || 'm3.medium'
  opts.name = opts.name || random() + '-' + random()

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
    SecurityGroupIds: [opts.group],
    BlockDeviceMappings: [{
      DeviceName: '/dev/sda1',
      Ebs: {DeleteOnTermination: true, VolumeSize: opts.disk}
    }]
  }

  self.name = opts.name
  self.group = opts.group
  self.ports = opts.ports
  self.client = client()
}

Driver.prototype.start = function (cb) {
  if (!cb) cb = noop
  var self = this

  self.describe(function (err, data) {
    if (err) cb(err) 
    if (data) {
      if (data.status == 'pending' || data.status == 'running') {
        return cb(null)
      } else if (data.status == 'stopping' || data.status == 'stopped') {
        var ids = {InstanceIds: [data.id]}
        self.client.startInstances(ids, function (err, data) {
          if (err) return cb(err)
          self.describe(cb)
        })
      } else {
        create()
      }
    }
  })

  function create () {
    async.waterfall([
      function (flow) {
        var params = {
          Description: self.group,
          GroupName: self.group
        }
        self.client.createSecurityGroup(params, function (err, data) {
          if (!err || err.code === 'InvalidGroup.Duplicate') return flow(null)
          if (err) return flow(err)
        })
      },
      function (flow) {
        var params = {
          GroupName: self.group,
          IpPermissions: self.ports.map(function (port) {
            return {
              IpProtocol: 'tcp',
              FromPort: port,
              ToPort: port,
              IpRanges: [{CidrIp: '0.0.0.0/0'}]
            }
          })
        }
        self.client.authorizeSecurityGroupIngress(params, function (err, data) {
          if (!err || err.code === 'InvalidPermission.Duplicate') return flow(null)
          if (err) return flow(err)
        })
      },
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
      self.describe(cb)
    })
  }
}

Driver.prototype.stop = function (cb) {
  if (!cb) cb = noop
  var self = this

  self.describe(function (err, res) {
    if (res.status == 'running' || res.status == 'pending') {
      var ids = {InstanceIds: [res.id]}
      self.client.stopInstances(ids, function (err, data) {
        if (err) return cb(err)
        self.describe(cb)
      })
    }
  })
}

Driver.prototype.destroy = function (cb) {
  if (!cb) cb = noop
  var self = this

  self.describe(function (err, res) {
    if (err) return cb(err)
    if (res.status == 'running' || res.status == 'pending' || res.status == 'stopped' || res.status == 'stopping') {
        var ids = {InstanceIds: [res.id]}
        self.client.terminateInstances(ids, function (err, data) {
          if (err) return cb(err)
          self.describe(cb)
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
    if ((data.Reservations.length == 0) || 
      (data.Reservations[0].length == 0)) return cb(null)
    var sorted = data.Reservations.sort(function (a, b) {
      return b.Instances[0].LaunchTime - a.Instances[0].LaunchTime
    })
    var instance = sorted[0].Instances[0]
    var info = {
      id: instance.InstanceId,
      private: instance.PrivateIpAddress,
      public: instance.PublicIpAddress,
      dns: instance.PublicDnsName,
      uptime: (Date.now() - instance.LaunchTime) / 1000,
      status: instance.State.Name
    }
    return cb(null, info) 
  })
}

module.exports = Driver