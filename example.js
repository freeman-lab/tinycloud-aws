var aws = require('tinycloud-aws')

var medium = aws({
  image: 'ami-d05e75b8',
  type: 'm3.medium',
  name: 'tomato',
  ports: [22, 80],
  key: 'mykey'
})

medium.start(function (err, res) {
  if (err) console.log(err)
  if (res) console.log(res)
})