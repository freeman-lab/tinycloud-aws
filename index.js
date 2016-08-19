var util = require('util')
var async = require('async')
var noop = function () {}

function Driver (options) {
  options = options || {}
  var self = this

  var spec = {
      DryRun: options.dry,
      ImageId: options.image,
      InstanceType: options.type,
      KeyName: options.key,
      MinCount: 1,
      MaxCount: 1,
      BlockDeviceMappings: [{
        DeviceName: '/dev/sda1',
        Ebs: {DeleteOnTermination: true, VolumeSize: options.size}
      }]
    }
  })

  this.specs = specs
  this.client = client()

}

Driver.prototype.start = function (cb) {
  if (!cb) cb = noop

  async.waterfall([
    function (flow) {
      self.client.runInstances(spec, function (err, reserved) {
        if (err) return flow(err)
        flow(null, reserved)
      })
    },
    function (reserved, flow) {
      var params = {
        Resources: _.map(reserved.Instances, function (i) { return i.InstanceId }),
        Tags: [{Key: 'Name', Value: reserved.Instances[0].SecurityGroups[0].GroupName}]
      }
      self.client.createTags(params, function (err, data) {
        if (err) return flow(err)
        flow(null, reserved)
      })
    }
  ], function (err, reserved) {
    if (err) return next(err)
    next(null, reserved)
  })

}