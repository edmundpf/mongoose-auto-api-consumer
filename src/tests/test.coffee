fs = require('fs')
consumer = require('../index')
assert = require('chai').assert
should = require('chai').should()

c = new consumer()
url = ''

USERNAME = 'user@email.com'
PASSWORD1 = 'testPass1!'
PASSWORD2 = 'testPass2!'
SECRET_KEY = 'secretKeyTest1!'
ACCESS_TOKEN = ''

customerModel = """
{
	name: 'customer',
	schema: {
		name: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
		},
		products: [{
			type: String
		}]
	},
}
"""

productModel = """
{
	name: 'product',
	schema: {
		name: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		price: {
			type: Number,
			unique: true,
			required: true,
		}
	},
}
"""

infoModel = """
{
	name: 'info',
	schema: {
		email: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		location: {
			type: String,
			unique: true,
			required: true,
		}
	},
}
"""

models =
	'./models/customer.js': customerModel
	'./models/product.js': productModel
	'./models/info.js': infoModel

#: Before Hook

before((done) ->
	this.timeout(10000)
	if !fs.existsSync('./models')
		fs.mkdirSync('./models')
	for key, val of models
		if !fs.existsSync(key)
			fs.writeFileSync(
				key,
				"module.exports = #{val}"
			)
	api = require('mongoose-auto-api.rest')
	url = "http://localhost:#{api.config.serverPort}"
	done()
)

#: Okay Assert

okayAssert = (res, args, resArray=false) ->
	argsEqual = true
	for key, val of args
		if !resArray and res.response[key] != val
			argsEqual = false
			break
		else if resArray and res.response[0][key] != val
			argsEqual = false
			break
	lineBreak()
	console.log(JSON.stringify(res))
	assert.equal(
		res.status == 'ok' and
		res.statusCode == 200 and
		argsEqual,
		true
	)


#: Okay Exists Assert

okayExistsAssert = (res, args, resArray=false) ->
	argsExist = true
	for key in args
		if !resArray and !res.response[key]?
			argsExist = false
			break
		else if resArray and !res.response[0][key]?
			argsExist = false
			break
	lineBreak()
	console.log(JSON.stringify(res))
	assert.equal(
		res.status == 'ok' and
		res.statusCode == 200 and
		argsExist,
		true
	)


#: Line Break Log

lineBreak = () ->
	console.log("\n#{'-'.repeat(process.stdout.columns)}")

#: Check constructor

describe 'Constructor', ->

	it 'Is object', ->
		lineBreak()
		assert.equal(typeof c, 'object')
	it 'Has URL', ->
		lineBreak()
		assert.equal(c.url?, true)
	it 'Correct URL', ->
		lineBreak()
		assert.equal(c.url, url)

#: Auth Methods

describe 'Auth Methods', ->
	it 'setSecretKey', ->
		res = await c.setSecretKey(
			key: SECRET_KEY
		)
		okayExistsAssert(
			res,
			['key'],
		)

	it 'signup', ->
		res = await c.signup(
			username: USERNAME
			password: PASSWORD1
			secret_key: SECRET_KEY
		)
		okayAssert(
			res,
			username: USERNAME
		)

	it 'login', ->
		res = await c.login(
			username: USERNAME
			password: PASSWORD1
		)
		ACCESS_TOKEN = res.response.access_token
		okayExistsAssert(
			res,
			['access_token']
		)

	it 'updatePassword', ->
		res = await c.updatePassword(
			username: USERNAME
			password: PASSWORD2
			current_password: PASSWORD1
			secret_key: SECRET_KEY
		)
		okayAssert(
			res,
			message: 'Password updated.'
		)

	it 'setAuthToken', ->
		res = c.setAuthToken(ACCESS_TOKEN)
		lineBreak()
		assert.equal(
			c.authToken,
			ACCESS_TOKEN
		)

	it 'verifyToken', ->
		res = await c.verifyToken(
			auth_token: c.authToken
		)
		okayAssert(
			res,
			message: 'Token verified.'
		)

#: API Methods

describe 'API Methods', ->

	it 'insert', ->
		res = await c.insert(
			'customer',
			name: 'Bob'
			email: 'bob@email.com'
			products: ['apples', 'oranges']
		)
		okayAssert(
			res,
			email: 'bob@email.com'
		)

	it 'update', ->
		res = await c.update(
			'customer',
			name: 'Bob',
			email: 'steve@email.com'
			update_primary: 'Steve'
		)
		okayAssert(
			res,
			nModified: 1
		)

	it 'get', ->
		res = await c.get(
			'customer',
			name: 'Steve'
		)
		okayAssert(
			res,
			email: 'steve@email.com',
			true
		)

	it 'getAll', ->
		res = await c.getAll(
			'customer',
			name: 'Steve'
		)
		okayAssert(
			res,
			email: 'steve@email.com',
			true
		)

	it 'push', ->
		await c.updatePush(
			'customer',
			name: 'Steve'
			products: ['oranges', 'pears']
		)
		res = await c.get(
			'customer',
			name: 'Steve'
		)
		lineBreak()
		console.log(JSON.stringify(res))
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			JSON.stringify(res.response[0].products) == JSON.stringify([
				'apples',
				'oranges'
				'oranges',
				'pears'
			]),
			true
		)

	it 'pushUnique', ->
		await c.updatePushUnique(
			'customer',
			name: 'Steve'
			products: ['oranges', 'bananas']
		)
		res = await c.get(
			'customer',
			name: 'Steve'
		)
		lineBreak()
		console.log(JSON.stringify(res))
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			JSON.stringify(res.response[0].products) == JSON.stringify([
				'apples',
				'oranges'
				'oranges',
				'pears',
				'bananas'
			]),
			true
		)

	it 'set', ->
		await c.updateSet(
			'customer',
			name: 'Steve'
			products: ['pears']
		)
		res = await c.get(
			'customer',
			name: 'Steve'
		)
		lineBreak()
		console.log(JSON.stringify(res))
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			JSON.stringify(res.response[0].products) == JSON.stringify([
				'pears'
			]),
			true
		)

	it 'find', ->
		await c.insert(
			'product',
			name: 'pears'
			price: 2.5
		)
		res = await c.find(
			'customer',
			where: [
				field: 'name'
				op: '$gt'
				value: 'Bob'
			]
			from: 'product'
			local_field: 'products'
			foreign_field: 'name'
			as: 'productInfo'
		)
		await c.removeAll(
			'product'
		)
		lineBreak()
		console.log(JSON.stringify(res))
		assert.equal(
			res.status = 'ok' and
			res.statusCode == 200 and
			res.response[0].name == 'Steve' and
			res.response[0].productInfo[0].price == 2.5,
			true
		)

	it 'schemaInfo', ->
		res = await c.schemaInfo('customer')
		okayExistsAssert(
			res,
			['list_fields']
		)

	it 'sterilize', ->
		res = await c.sterilize('customer')
		okayAssert(
			res,
			nModified: 1
		)

	it 'remove', ->
		res = await c.insert(
			'customer',
			name: 'Veronica'
			email: 'veronica@email.com'
			products: ['apples', 'oranges']
		)
		res = await c.insert(
			'customer',
			name: 'Zebra'
			email: 'zebra@email.com'
			products: ['apples', 'oranges']
		)
		res = await c.remove(
			'customer',
			name: 'Zebra'
		)
		okayAssert(
			res,
			deletedCount: 1
		)
	it 'removeAll', ->
		res = await c.removeAll(
			'customer'
		)
		okayAssert(
			res,
			deletedCount: 2
		)

#: Cleanup

describe 'Cleanup', ->

	it 'Admin Auth cleanup', ->
		user = await c.removeAll('user_auth')
		secret = await c.removeAll('secret_key')
		okayAssert(
			user,
			deletedCount: 1
		)
		okayAssert(
			secret,
			deletedCount: 1
		)

#: Set Port

describe 'setPort', ->

	it 'Invalid - returns false', ->
		res = c.setPort('test')
		assert.equal(res, false)
	it 'Valid - returns true', ->
		res = c.setPort(5000)
		assert.equal(res, true)
	it 'Correct Port', ->
		assert.equal(c.port, 5000)
	it 'Correct URL', ->
		assert.equal(c.url, "http://localhost:5000")

after((done) ->
	for key, val of models
		if fs.existsSync(key)
			fs.unlinkSync(key)
	if fs.existsSync('./models')
		fs.rmdirSync('./models')
	done()
	process.exit(0)
)

#::: End Program :::