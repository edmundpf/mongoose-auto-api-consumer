var Controller, a, collectionReq, deleteReq, error, getReq, postReq, request, serverConfig, url, urlStr;

a = require('axios');

try {
  serverConfig = require('../../../../appConfig.json');
} catch (error1) {
  error = error1;
  try {
    serverConfig = require('../../appConfig.json');
  } catch (error1) {
    error = error1;
    console.log('Could not find app config file.');
    process.exit(1);
  }
}

url = `http://localhost:${serverConfig.serverPort}`;

//::: HELPERS :::

// Request
request = async function(reqUrl, func) {
  var res;
  try {
    res = (await func(reqUrl));
    return {
      ...res.data,
      statusCode: res.status
    };
  } catch (error1) {
    error = error1;
    return {
      ...error.response.data,
      statusCode: error.response.status
    };
  }
};

// Endpoint with Query Args to URL String
urlStr = function(endpoint, args) {
  var isArray, key, queryStr, val;
  queryStr = '';
  if (args != null) {
    for (key in args) {
      val = args[key];
      isArray = Array.isArray(val);
      if (isArray && val.length > 0 && typeof val[0] !== 'object') {
        args[key] = val.join(',');
      } else if (typeof val === 'object' || (isArray && val.length > 0 && typeof val[0] === 'object')) {
        args[key] = JSON.stringify(val);
      } else if (isArray && val.length === 0) {
        args[key] = '[]';
      }
    }
    queryStr = new URLSearchParams(args).toString();
  }
  if (queryStr.length > 0) {
    return `${url}${endpoint}?${queryStr}`;
  } else {
    return `${url}${endpoint}`;
  }
};

//: Collection request
collectionReq = async function(collection, endpoint, method, args) {
  if (method === 'get') {
    return (await getReq(`/${collection}/${endpoint}`, args));
  } else if (method === 'post') {
    return (await postReq(`/${collection}/${endpoint}`, args));
  } else if (method === 'delete') {
    return (await deleteReq(`/${collection}/${endpoint}`, args));
  }
};

// Get Request
getReq = async function(endpoint, args) {
  return (await request(urlStr(endpoint, args), a.get.bind(a)));
};

// Post Request
postReq = async function(endpoint, args) {
  return (await request(urlStr(endpoint, args), a.post.bind(a)));
};

// Delete Request
deleteReq = async function(endpoint, args) {
  return (await request(urlStr(endpoint, args), a.delete.bind(a)));
};

//::: CONTROLLER CLASS :::
Controller = class Controller {
  constructor(args) {
    if ((args != null) && (args.port != null)) {
      this.port = args.port;
      url = `http://localhost:${this.port}`;
    }
    this.url = url;
  }

  //: Set Auth Token
  setAuthToken(authToken) {
    this.authToken = authToken;
    a.defaults.headers.common.authorization = authToken;
    return true;
  }

  //: Insert record
  async insert(collection, args) {
    return (await collectionReq(collection, 'insert', 'post', args));
  }

  //: Update record
  async update(collection, args) {
    return (await collectionReq(collection, 'update', 'post', args));
  }

  //: Delete record
  async remove(collection, args) {
    return (await collectionReq(collection, 'delete', 'delete', args));
  }

  //: Delete all records
  async removeAll(collection, args) {
    return (await collectionReq(collection, 'delete_all', 'delete', args));
  }

  //: Get record
  async get(collection, args) {
    return (await collectionReq(collection, 'get', 'get', args));
  }

  //: Get all records
  async getAll(collection, args) {
    return (await collectionReq(collection, 'get_all', 'get', args));
  }

  //: Find records
  async find(collection, args) {
    return (await collectionReq(collection, 'find', 'get', args));
  }

  //: Get Schema Info
  async schemaInfo(collection, args) {
    return (await collectionReq(collection, 'schema', 'get', args));
  }

  //: Sterilize collection
  async sterilize(collection, args) {
    return (await collectionReq(collection, 'sterilize', 'post', args));
  }

  //: Push update array
  async updatePush(collection, args) {
    return (await collectionReq(collection, 'push', 'post', args));
  }

  //: Push Unique update array
  async updatePushUnique(collection, args) {
    return (await collectionReq(collection, 'push_unique', 'post', args));
  }

  //: Set update array
  async updateSet(collection, args) {
    return (await collectionReq(collection, 'set', 'post', args));
  }

  //: Set Secret Key
  async setSecretKey(args) {
    return (await postReq('/update_secret_key', args));
  }

  //: Login
  async login(args) {
    return (await postReq('/login', args));
  }

  //: Signup
  async signup(args) {
    return (await postReq('/signup', args));
  }

  //: Update Password
  async updatePassword(args) {
    return (await postReq('/update_password', args));
  }

  //: Verify Token
  async verifyToken(args) {
    return (await getReq('/verify_token', args));
  }

};

module.exports = Controller;
