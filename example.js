var aws = require('./index')

var medium = aws({
  name: 'tomato',
  key: 'voltron',
})

var command = process.argv[2]

switch (command) {
  case 'start':
    medium.start(function (err, res) {
      if (err) console.log(err)
      if (res) console.log(res)
    })
    break

  case 'stop':
    medium.stop(function (err, res) {
      if (err) console.log(err)
      if (res) console.log(res)
    })
    break

  case 'destroy':
    medium.destroy(function (err, res) {
      if (err) console.log(err)
      if (res) console.log(res)
    })
    break

  case 'describe':
    medium.describe(function (err, res) {
      if (err) console.log(err)
      if (res) console.log(res)
    })
    break
}