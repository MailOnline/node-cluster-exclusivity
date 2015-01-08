# node-cluster-exclusivity

Simple to use semaphore designed for when only one worker **can** do the work, but redundancy is required.
Requires a shared redis instance.

Features:
* Semaphore that survives application restarts
* Highly configurable
* The semaphore will timeout in the event of an unresponsive or dead application
* Multiple locks can be created per process

## Getting Started

Install:
```
npm install cluster-exclusivity
```

Create a lock:
```javascript
var lock = require('cluster-exclusivity').init();
```

Whenever you need to, check it:
```javascript
lock.ownLock(); //Returns true/false
```

###Lock Options
In the ```init``` method, an object can be provided for options, the default of which are:

```javascript
{
  host: '127.0.0.1',
  port: 6379,
  database: 0,
  lockKey: 'lockOwner',
  timeout: 5 //seconds
}
```
Additionally another property ```lockId``` can be specified, which replaces the auto-generated uuid
used for determining who owns the lock.
