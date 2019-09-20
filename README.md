# Mongoose Auto API - API Consumption Module
[![Build Status](https://travis-ci.org/edmundpf/mongoose-auto-api-consumer.svg?branch=master)](https://travis-ci.org/edmundpf/mongoose-auto-api-consumer)
[![npm version](https://badge.fury.io/js/mongoose-auto-api.consumer.svg)](https://badge.fury.io/js/mongoose-auto-api.consumer)
> Automatic Mongoose REST API - Rest API Module ☕

## Install
* `npm i -S mongoose-auto-api.consumer`

## Model Setup
* [Model Setup - mongoose-auto-api.info](https://github.com/edmundpf/mongoose-auto-api-info/blob/master/README.md#model-setup)

## Usage
``` bash
$ consumer = require('mongoose-auto-api.consumer')
```

## Methods
* URL Attribute i.e. *consumer.url*
	* Gets API url
* Port Attribute i.e. *consumer.port*
	* Gets API port
* *setPort*
	* sets server port for requests
	* parm - *port* (Number)
* *setAuthToken*
	* sets auth token for requests
	* parm - *authToken* (str)
* Collection methods
	* parms - *collection* (str), *args* (obj)
		* collection denotes the mongoose collection name, args are url query parameters
		* See [Rest API - mongoose-auto-api.rest](https://github.com/edmundpf/mongoose-auto-api-rest/blob/master/README.md#rest-api-details) for API query parameters
	* **insert** -> /collection/insert
	* **update** -> /collection/update
	* **remove** -> /collection/delete
	* **removeAll** -> /collection/delete_all
	* **get** -> /collection/get
	* **getAll** -> /collection/get_all
	* **find** -> /collection/find
	* **schemaInfo** -> /collection/schema
	* **sterilize** -> /collection/sterilize
	* **updatePush** -> /collection/push
	* **updatePushUnique** -> /collection/push_unique
	* **updateSet** -> /collection/set
* Auth methods
	* parms - *args* (obj)
		* args are url query parameters, see Rest API link above for query parameters
	* **setSecretKey** -> /update_secret_key
	* **login** -> /login
	* **signup** -> /signup
	* **updatePassword** -> /update_password
	* **verifyToken** -> /verify_token
