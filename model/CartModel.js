const db = require('../config/db');
const { tables } = require('../config/config');
const bcrypt = require("bcrypt");

/**
 * Cart model
 */
class CartModel {
    constructor() {

    }
   
    /**
     * 
     * @param {Number} userId - Provide user's to get all the items added to the cart
     * @returns - Cart details of the user in Array
     */
    async getUserCart(userId,) {       
        let query = await db(`${tables.cart} as c`).select({"id": "c.id",
        "user_id": "c.user_id",
        "res_id": "c.res_id",
        "item_id": "c.item_id",
        "qty": "c.qty",
        "created_date": "c.created_date",
        "name": "i.name",
        "category": "cat.name",
        "price": "i.price"}).join(`${tables.items} as i`, 'c.item_id', 'i.id').join(`${tables.category} as cat`, 'i.category', 'cat.id').where({user_id:userId}).orderBy("c.id", "asc");
        return query;
    }

  
    async getUserAllCartItems(userId) {
        let query = await db(`${tables.cart} as c`).select({"id": "c.id",
        "user_id": "c.user_id",
        "res_id": "c.res_id",
        "item_id": "c.item_id",
        "qty": "c.qty",
        "created_date": "c.created_date",
        "name": "i.name",
        "category": "cat.name",
        "price": "i.price"}).join(`${tables.items} as i`, 'c.item_id', 'i.id').join(`${tables.category} as cat`, 'i.category', 'cat.id').where({user_id:userId}).orderBy("c.id", "asc");
        return query;
    }

    async upsertItem(data) {

        let updateQuery = await db(tables.cart).update({qty:data.qty}).where({user_id:data.userId,item_id:data.itemId});

        if(!updateQuery){
            let query = await db(tables.cart).insert({item_id:data.itemId,user_id:data.userId, res_id:data.restaurantId, qty:data.qty, created_date:Math.floor(Date.now()/1000)});
            return query;
        }

        return updateQuery
        
    }

    async isItemAvailable(itemId) {

        let query = await db(tables.items).select({"itemId":"id"}).where({id:itemId, is_available:1}).limit(1);
        return query.length
        
    }

    async itemExistsInCart(data) {
        console.log(data)
        let query = await db(tables.cart).where({user_id:data.userId, item_id:data.itemId});
        return query.length ? true : false ;
        
    }

    async removeItem(userId, itemId) {

        let query = await db(tables.cart).where({user_id:userId, item_id:itemId}).del();
        return query;
        
    }

    async addOrder(data) {
        
        let query = await db(tables.order).insert({
            user_id:data.userId,
            res_id:data.restaurantId,
            subtotal:data.subtotal,
            tax_amount:0,
            total:data.total,
            status:'ACCEPTED',
            created_date:Math.floor(Date.now()/1000)
        });
        return query;
    }

    async addOrderItems(data) {
        
        let query = await db(tables.orderItems).insert(data);
        return query;
    }

    async clearCart(userId) {
        
        let query = await db(tables.cart).where({user_id:userId}).del();
        return query;
    }

    async getOrders(userId, page, orderId) {
        
        /* let query = await db(`${tables.order} as o`).select("*")
                            .join(`${tables.orderItems} as oi`, 'o.id', 'oi.order_id')
                            .where({'o.user_id':userId})
                            .orderBy("o.id", "desc")
                            .limit(30)
                            .offset(30*page); */
        let query = await db(`${tables.order} as o`).select("*")        
        .where({'o.user_id':userId})
        .orderBy("o.id", "desc")
        .limit(30)
        .offset(30*page);
        return query;
    }

    async getOrder(userId, orderId) {
        
        let query = await db(tables.order).select("*")
                            .where({'user_id':userId, 'id':orderId})
        if(!query.length){
            return []
        }
        query[0].items = await db(tables.orderItems).select("*").where({'order_id':query[0].id});
        return query;
    }

    async getOrderByRestaurantId(restaurantId, orderId) {
        
        let query = await db(tables.order).select("*")
                            .where({'id':orderId, 'res_id':restaurantId})
        if(!query.length){
            return []
        }
        query[0].items = await db(tables.orderItems).select("*").where({'order_id':query[0].id});
        return query;
    }

    async getAcceptedOrder(userId) {
        
        let query = await db(`${tables.order} as o`).select("*")
                            .where({'o.user_id':userId, 'o.status':'ACCEPTED'})
                            .orderBy("o.id", "desc")
        return query;
    }

    async updateOrderStatus(data) {
        let query = await db(tables.order).update({status:data.status}).where({id:data.orderId, res_id:data.restaurantId});
        return query;
    }

}

let cartModel = new CartModel();
module.exports = cartModel;