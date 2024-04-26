/**
 * Application routes mapping
 */
module.exports = {
	"/test": {
		GET: 'Test.test'		
	},
	"/user/register": {
		PUT: 'User.register',
		allowedContentType:['application/json']
	},
	"/user/login": {
		POST: 'User.login',
		allowedContentType:['application/json']
	},
	"/user/logout": {
		GET: 'User.logout',
		authorization:["JWT"]
	},
	"/user/:USERID/cart": {
		GET: 'Cart.view',		
		authorization:["JWT"]
	},
	"/user/:USERID/cart/place_order": {
		PUT: 'Cart.placeOrder',
		allowedContentType:['application/json'],
		authorization:["JWT"]
	},
	"/user/:USERID/item/:ITEMID": {
		PUT: 'Cart.addItem',
		DELETE: 'Cart.removeItem',
		allowedContentType:['application/json'],
		authorization:["JWT"]
	},
	"/user/:USERID/orders": {
		GET: 'Order.view',		
		authorization:["JWT"]
	},
	"/user/:USERID/order/:ORDERID": {
		GET: 'Order.getOrder',		
		authorization:["JWT"]
	},
	"/user/:USERID/activeOrder": {
		GET: 'Order.currentOrder',		
		authorization:["JWT"]
	},
	"/restaurant/:RESID/items": {
		GET: 'Restaurant.viewItems',		
		authorization:["JWT"]
	},
	"/restaurant/:RESID/item": {
		PUT: 'Restaurant.addItem',
		allowedContentType:['application/json'],
		authorization:["JWT"]
	},
	"/restaurant/token": {
		GET: 'Restaurant.getToken',
		allowedContentType:['application/json']
	},
	"/restaurant/:RESID/item/:ITEMID": {
		PATCH: 'Restaurant.updateItem',
		DELETE: 'Restaurant.removeItem',
		allowedContentType:['application/json'],
		authorization:["JWT"]
	},
	"/restaurant/:RESID/order/:ORDERID": {
		PATCH: 'Order.updateOrderStatus',
		allowedContentType:['application/json'],
		authorization:["JWT"]
	}
};
