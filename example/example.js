var lock1 = require('../index.js').init(),
    lock2 = require('../index.js').init({lockKey: 'lock2'}),
    lock3 = require('../index.js').init({lockKey: 'lock3/4'}),
    lock4 = require('../index.js').init({lockKey: 'lock3/4'});

setInterval(function () {
  console.info('Got lock1?', lock1.ownLock());
  console.info('Got lock2?', lock2.ownLock());
  console.info('Either [Lock3 || lock4] will have it.');
  console.info(' lock3?', lock3.ownLock());
  console.info(' lock4?', lock4.ownLock());
  console.info('');
}, 1500);
