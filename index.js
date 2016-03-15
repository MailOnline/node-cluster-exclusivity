var _ = require('lodash'),
    Redis = require('redis'),
    uuid = require('uuid');

var defaultConfig = {
  host: '127.0.0.1',
  port: 6379,
  database: 0,
  lockKey: 'lockOwner',
  timeout: 5 //seconds
}

function bootstrap (options) {
  var config = _.extend(defaultConfig, options),
      redis = Redis.createClient(config.port, config.host),
      myId = config.lockId || uuid.v4(),
      owned = 0;

  redis.select(config.database);

  var semaphoreScript = '\
    local lockKey = "' + config.lockKey +'" \
    local uuid = KEYS[1] \
    if redis.call("exists", lockKey) == 1 then \
      if redis.call("get", lockKey) == uuid then \
        redis.call("expire", lockKey, ' + config.timeout + ') \
        return { "owned", 1 } \
      else \
        return { "owned", 0 } \
      end \
    else \
      redis.call("setex", lockKey, ' + config.timeout + ', uuid) \
      return { "owned", 1 } \
    end';


  function loadScript (callback) {
    redis.script('load', semaphoreScript, callback);
  }

  function attachNewFunc (sha) {
    redis.attainSemaphore = function (uuid, callback) {
      var wrapped = function (err, answer) {
        if (err && err.message.match(/NOSCRIPT/)) {
          loadScript(function (err, sha) {
            attachNewFunc(sha);
            return redis.attainSemaphore(uuid, callback);
          });
        } else {
          return callback(err, answer);
        }
      }


      var args = [sha, 1, uuid, wrapped];

      redis.evalsha.apply(redis, args);
    }
  }

  loadScript(function (err, sha) {
    attachNewFunc(sha);

    setInterval(function () {
      redis.attainSemaphore(myId, function (err, answer) {
        answer = _.object([answer]);

        owned = answer.owned;
      });
    }, 10);
  });

  function ownLock () {
    return !!owned;
  }

  return {
    ownLock: ownLock
  }
}


module.exports = {
  init: bootstrap
}
