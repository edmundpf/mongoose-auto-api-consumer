a = require('axios')

try
	serverConfig = require('../../../../appConfig.json')
catch error
	try
		serverConfig = require('../../appConfig.json')
	catch error
		console.log('Could not find app config file.')
		process.exit(1)

url = "http://localhost:#{serverConfig.serverPort}"

#::: HELPERS :::

# Request

request = (reqUrl, func) ->
	try
		res = await func(reqUrl)
		return {
			...res.data,
			statusCode: res.status
		}
	catch error
		return {
			...error.response.data,
			statusCode: error.response.status
		}

# Endpoint with Query Args to URL String

urlStr = (endpoint, args) ->
	queryStr = ''
	if args?
		for key, val of args
			isArray = Array.isArray(val)
			if isArray and val.length > 0 and typeof val[0] != 'object'
				args[key] = val.join(',')
			else if typeof val == 'object' or (isArray and val.length > 0 and typeof val[0] == 'object')
				args[key] = JSON.stringify(val)
			else if isArray and val.length == 0
				args[key] = '[]'
		queryStr = new URLSearchParams(args).toString()
	if queryStr.length > 0
		return "#{url}#{endpoint}?#{queryStr}"
	else
		return "#{url}#{endpoint}"

#: Collection request

collectionReq = (collection, endpoint, method, args) ->
	if method == 'get'
		return await getReq(
			"/#{collection}/#{endpoint}",
			args
		)
	else if method == 'post'
		return await postReq(
			"/#{collection}/#{endpoint}",
			args
		)
	else if method == 'delete'
		return await deleteReq(
			"/#{collection}/#{endpoint}",
			args
		)

# Get Request

getReq = (endpoint, args) ->
	return await request(
		urlStr(endpoint, args),
		a.get.bind(a)
	)

# Post Request

postReq = (endpoint, args) ->
	return await request(
		urlStr(endpoint, args),
		a.post.bind(a)
	)

# Delete Request

deleteReq = (endpoint, args) ->
	return await request(
		urlStr(endpoint, args),
		a.delete.bind(a)
	)

#::: CONTROLLER CLASS :::

class Controller
	constructor: (args) ->
		if args? and args.port?
			this.port = args.port
			url = "http://localhost:#{this.port}"
		this.url = url

	#: Set Auth Token

	setAuthToken: (authToken) ->
		this.authToken = authToken
		a.defaults.headers.common.authorization = authToken
		return true

	#: Insert record

	insert: (collection, args) ->
		return await collectionReq(
			collection,
			'insert',
			'post',
			args
		)

	#: Update record

	update: (collection, args) ->
		return await collectionReq(
			collection,
			'update',
			'post',
			args
		)

	#: Delete record

	remove: (collection, args) ->
		return await collectionReq(
			collection,
			'delete',
			'delete',
			args
		)

	#: Delete all records

	removeAll: (collection, args) ->
		return await collectionReq(
			collection,
			'delete_all',
			'delete',
			args
		)

	#: Get record

	get: (collection, args) ->
		return await collectionReq(
			collection,
			'get',
			'get',
			args
		)

	#: Get all records

	getAll: (collection, args) ->
		return await collectionReq(
			collection,
			'get_all',
			'get',
			args
		)

	#: Find records

	find: (collection, args) ->
		return await collectionReq(
			collection,
			'find',
			'get',
			args
		)

	#: Get Schema Info

	schemaInfo: (collection, args) ->
		return await collectionReq(
			collection,
			'schema',
			'get',
			args
		)

	#: Sterilize collection

	sterilize: (collection, args) ->
		return await collectionReq(
			collection,
			'sterilize',
			'post',
			args
		)

	#: Push update array

	updatePush: (collection, args) ->
		return await collectionReq(
			collection,
			'push',
			'post',
			args
		)

	#: Push Unique update array

	updatePushUnique: (collection, args) ->
		return await collectionReq(
			collection,
			'push_unique',
			'post',
			args
		)

	#: Set update array

	updateSet: (collection, args) ->
		return await collectionReq(
			collection,
			'set',
			'post',
			args
		)

	#: Set Secret Key

	setSecretKey: (args) ->
		return await postReq(
			'/update_secret_key'
			args
		)

	#: Login

	login: (args) ->
		return await postReq(
			'/login',
			args
		)

	#: Signup

	signup: (args) ->
		return await postReq(
			'/signup',
			args
		)

	#: Update Password

	updatePassword: (args) ->
		return await postReq(
			'/update_password',
			args
		)

	#: Verify Token

	verifyToken: (args) ->
		return await getReq(
			'/verify_token',
			args
		)

module.exports = Controller