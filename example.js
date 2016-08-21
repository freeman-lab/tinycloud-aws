var aws = require('./index')

var medium = aws({
  image: 'ami-d05e75b8',
  type: 'm3.medium',
  name: 'tomato',
  key: 'voltron'
})

var command = process.argv[2]

switch (command) {
  case 'start':
    medium.start(function (err, res) {
      if (err) console.log(err)
      if (res) console.log(res)
    })

  case 'destroy':
    medium.destroy(function (err, res) {
      if (err) console.log(err)
      if (res) console.log(res)
    })

  case 'describe':
    medium.describe(function (err, res) {
      if (err) console.log(err)
      if (res) console.log(res)
    })
}

// medium.start(function (err, res) {
//   if (err) console.log(err)
//   if (res) console.log(res)
// })

// medium.describe(function (err, res) {
//   console.log(err)
//   console.log(res)
// })

// medium.destroy(function (err, res) {
//   if (err) console.log(err)
//   if (res) console.log(res)
// })