var ACCESS_TOKEN, PASSWORD1, PASSWORD2, SECRET_KEY, USERNAME, assert, c, consumer, customerModel, fs, infoModel, lineBreak, models, okayAssert, okayExistsAssert, productModel, should, url;

fs = require('fs');

consumer = require('../index');

assert = require('chai').assert;

should = require('chai').should();

c = new consumer();

url = '';

USERNAME = 'user@email.com';

PASSWORD1 = 'testPass1!';

PASSWORD2 = 'testPass2!';

SECRET_KEY = 'secretKeyTest1!';

ACCESS_TOKEN = '';

customerModel = "{\n	name: 'customer',\n	schema: {\n		name: {\n			type: String,\n			unique: true,\n			required: true,\n			primaryKey: true,\n		},\n		email: {\n			type: String,\n			unique: true,\n			required: true,\n		},\n		products: [{\n			type: String\n		}]\n	},\n}";

productModel = "{\n	name: 'product',\n	schema: {\n		name: {\n			type: String,\n			unique: true,\n			required: true,\n			primaryKey: true,\n		},\n		price: {\n			type: Number,\n			unique: true,\n			required: true,\n		}\n	},\n}";

infoModel = "{\n	name: 'info',\n	schema: {\n		email: {\n			type: String,\n			unique: true,\n			required: true,\n			primaryKey: true,\n		},\n		location: {\n			type: String,\n			unique: true,\n			required: true,\n		}\n	},\n}";

models = {
  './models/customer.js': customerModel,
  './models/product.js': productModel,
  './models/info.js': infoModel
};

//: Before Hook
before(function(done) {
  var api, key, val;
  this.timeout(10000);
  if (!fs.existsSync('./models')) {
    fs.mkdirSync('./models');
  }
  for (key in models) {
    val = models[key];
    if (!fs.existsSync(key)) {
      fs.writeFileSync(key, `module.exports = ${val}`);
    }
  }
  api = require('mongoose-auto-api.rest');
  url = `http://localhost:${api.config.serverPort}`;
  return done();
});

//: Okay Assert
okayAssert = function(res, args, resArray = false) {
  var argsEqual, key, val;
  argsEqual = true;
  for (key in args) {
    val = args[key];
    if (!resArray && res.response[key] !== val) {
      argsEqual = false;
      break;
    } else if (resArray && res.response[0][key] !== val) {
      argsEqual = false;
      break;
    }
  }
  lineBreak();
  console.log(JSON.stringify(res));
  return assert.equal(res.status === 'ok' && res.statusCode === 200 && argsEqual, true);
};

//: Okay Exists Assert
okayExistsAssert = function(res, args, resArray = false) {
  var argsExist, i, key, len;
  argsExist = true;
  for (i = 0, len = args.length; i < len; i++) {
    key = args[i];
    if (!resArray && (res.response[key] == null)) {
      argsExist = false;
      break;
    } else if (resArray && (res.response[0][key] == null)) {
      argsExist = false;
      break;
    }
  }
  lineBreak();
  console.log(JSON.stringify(res));
  return assert.equal(res.status === 'ok' && res.statusCode === 200 && argsExist, true);
};

//: Line Break Log
lineBreak = function() {
  return console.log(`\n${'-'.repeat(process.stdout.columns)}`);
};

//: Check constructor
describe('Constructor', function() {
  it('Is object', function() {
    lineBreak();
    return assert.equal(typeof c, 'object');
  });
  it('Has URL', function() {
    lineBreak();
    return assert.equal(c.url != null, true);
  });
  return it('Correct URL', function() {
    lineBreak();
    return assert.equal(c.url, url);
  });
});

//: Auth Methods
describe('Auth Methods', function() {
  it('setSecretKey', async function() {
    var res;
    res = (await c.setSecretKey({
      key: SECRET_KEY
    }));
    return okayExistsAssert(res, ['key']);
  });
  it('signup', async function() {
    var res;
    res = (await c.signup({
      username: USERNAME,
      password: PASSWORD1,
      secret_key: SECRET_KEY
    }));
    return okayAssert(res, {
      username: USERNAME
    });
  });
  it('login', async function() {
    var res;
    res = (await c.login({
      username: USERNAME,
      password: PASSWORD1
    }));
    ACCESS_TOKEN = res.response.access_token;
    return okayExistsAssert(res, ['access_token']);
  });
  it('updatePassword', async function() {
    var res;
    res = (await c.updatePassword({
      username: USERNAME,
      password: PASSWORD2,
      current_password: PASSWORD1,
      secret_key: SECRET_KEY
    }));
    return okayAssert(res, {
      message: 'Password updated.'
    });
  });
  it('setAuthToken', function() {
    var res;
    res = c.setAuthToken(ACCESS_TOKEN);
    lineBreak();
    return assert.equal(c.authToken, ACCESS_TOKEN);
  });
  return it('verifyToken', async function() {
    var res;
    res = (await c.verifyToken({
      auth_token: c.authToken
    }));
    return okayAssert(res, {
      message: 'Token verified.'
    });
  });
});

//: API Methods
describe('API Methods', function() {
  it('insert', async function() {
    var res;
    res = (await c.insert('customer', {
      name: 'Bob',
      email: 'bob@email.com',
      products: ['apples', 'oranges']
    }));
    return okayAssert(res, {
      email: 'bob@email.com'
    });
  });
  it('update', async function() {
    var res;
    res = (await c.update('customer', {
      name: 'Bob',
      email: 'steve@email.com',
      update_primary: 'Steve'
    }));
    return okayAssert(res, {
      nModified: 1
    });
  });
  it('get', async function() {
    var res;
    res = (await c.get('customer', {
      name: 'Steve'
    }));
    return okayAssert(res, {
      email: 'steve@email.com'
    }, true);
  });
  it('getAll', async function() {
    var res;
    res = (await c.getAll('customer', {
      name: 'Steve'
    }));
    return okayAssert(res, {
      email: 'steve@email.com'
    }, true);
  });
  it('push', async function() {
    var res;
    await c.updatePush('customer', {
      name: 'Steve',
      products: ['oranges', 'pears']
    });
    res = (await c.get('customer', {
      name: 'Steve'
    }));
    lineBreak();
    console.log(JSON.stringify(res));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && JSON.stringify(res.response[0].products) === JSON.stringify(['apples', 'oranges', 'oranges', 'pears']), true);
  });
  it('pushUnique', async function() {
    var res;
    await c.updatePushUnique('customer', {
      name: 'Steve',
      products: ['oranges', 'bananas']
    });
    res = (await c.get('customer', {
      name: 'Steve'
    }));
    lineBreak();
    console.log(JSON.stringify(res));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && JSON.stringify(res.response[0].products) === JSON.stringify(['apples', 'oranges', 'oranges', 'pears', 'bananas']), true);
  });
  it('set', async function() {
    var res;
    await c.updateSet('customer', {
      name: 'Steve',
      products: ['pears']
    });
    res = (await c.get('customer', {
      name: 'Steve'
    }));
    lineBreak();
    console.log(JSON.stringify(res));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && JSON.stringify(res.response[0].products) === JSON.stringify(['pears']), true);
  });
  it('find', async function() {
    var res;
    await c.insert('product', {
      name: 'pears',
      price: 2.5
    });
    res = (await c.find('customer', {
      where: [
        {
          field: 'name',
          op: '$gt',
          value: 'Bob'
        }
      ],
      from: 'product',
      local_field: 'products',
      foreign_field: 'name',
      as: 'productInfo'
    }));
    await c.removeAll('product');
    lineBreak();
    console.log(JSON.stringify(res));
    return assert.equal(res.status = 'ok' && res.statusCode === 200 && res.response[0].name === 'Steve' && res.response[0].productInfo[0].price === 2.5, true);
  });
  it('schemaInfo', async function() {
    var res;
    res = (await c.schemaInfo('customer'));
    return okayExistsAssert(res, ['list_fields']);
  });
  it('sterilize', async function() {
    var res;
    res = (await c.sterilize('customer'));
    return okayAssert(res, {
      nModified: 1
    });
  });
  it('remove', async function() {
    var res;
    res = (await c.insert('customer', {
      name: 'Veronica',
      email: 'veronica@email.com',
      products: ['apples', 'oranges']
    }));
    res = (await c.insert('customer', {
      name: 'Zebra',
      email: 'zebra@email.com',
      products: ['apples', 'oranges']
    }));
    res = (await c.remove('customer', {
      name: 'Zebra'
    }));
    return okayAssert(res, {
      deletedCount: 1
    });
  });
  return it('removeAll', async function() {
    var res;
    res = (await c.removeAll('customer'));
    return okayAssert(res, {
      deletedCount: 2
    });
  });
});

//: Cleanup
describe('Cleanup', function() {
  return it('Admin Auth cleanup', async function() {
    var secret, user;
    user = (await c.removeAll('user_auth'));
    secret = (await c.removeAll('secret_key'));
    okayAssert(user, {
      deletedCount: 1
    });
    return okayAssert(secret, {
      deletedCount: 1
    });
  });
});

//: Set Port
describe('setPort', function() {
  it('Invalid - returns false', function() {
    var res;
    res = c.setPort('test');
    return assert.equal(res, false);
  });
  it('Valid - returns true', function() {
    var res;
    res = c.setPort(5000);
    return assert.equal(res, true);
  });
  it('Correct Port', function() {
    return assert.equal(c.port, 5000);
  });
  return it('Correct URL', function() {
    return assert.equal(c.url, "http://localhost:5000");
  });
});

after(function(done) {
  var key, val;
  for (key in models) {
    val = models[key];
    if (fs.existsSync(key)) {
      fs.unlinkSync(key);
    }
  }
  if (fs.existsSync('./models')) {
    fs.rmdirSync('./models');
  }
  done();
  return process.exit(0);
});

//::: End Program :::
