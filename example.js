var aws = require('./index')

var medium = aws({
  image: 'ami-d05e75b8',
  type: 'm3.medium',
  name: 'tomato',
  key: 'voltron'
})

// medium.start(function (err, res) {
//   if (err) console.log(err)
//   if (res) console.log(res)
// })

// medium.describe(function (err, res) {
//   console.log(res)
// })

medium.destroy(function (err, res) {
  if (err) console.log(err)
  if (res) console.log(res)
})