# Description:
#   Posts an animated gif of eastbound and down https://i.imgur.com/2pqWmsF.gif
#
# Commands:
#   hubot yeeehaaaaa
#   hubot awwwwwwwyeah
#
# Author:
#   leevigraham


yeeha = [
  "https://i.imgur.com/2pqWmsF.gif"
]


module.exports = (robot) ->

  robot.hear /(ye+ha+|aw+yeah)/i, (msg) ->
    msg.send msg.random yeeha
