const db = require('../config/db');
const { tables } = require('../config/config');

class RestaurantModel {
    constructor() {

    }
    
    async getRestaurantDetail() {       
        let query = await db(`${tables.restaurant}`).select("*").limit(1);
        return query.length ? query[0]: false;
    }

    async getItems(restaurantId, page) {       
        let query = await db(`${tables.items}`).select("*").where({res_id:restaurantId, status:'ACTIVE'}).orderBy("id", "asc").limit(30).offset(30*page);
        return query;
    }

    async getItem(itemId) {       
        let query = await db(`${tables.items}`).select("*").where({id:itemId});
        return query.length ? query[0] : false;
    }

    async addItem(data) {        
        let query = await db(tables.items).insert({            
            res_id:data.restaurantId,
            name:data.name,
            category:data.category,
            price:data.price,
            is_available:1,
            status:'ACTIVE',
            created_date:Math.floor(Date.now()/1000)
        });
        return query.length ? query[0]: false;
    }

    async isItemNameExists(data) {        
        let query = await db(tables.items).where({            
            res_id:data.restaurantId,
            name:data.name,
            status:'ACTIVE'
        }).limit(1);
        return query.length ? true: false;
    }

    async updateItem(data) {
        let updateData = {};
        
        if(data.name){
            updateData.name = data.name;
        }

        if(data.category){
            updateData.category = data.category;
        }

        if(data.price){
            updateData.price = data.price;
        }

        if(data.status){
            updateData.status = data.status;
        }

        if(typeof data.is_available != "undefined"){
            updateData.is_available = data.is_available ? 1 : 0;
        }

        if(!Object.keys(updateData).length){
            return false;
        }
        
        let query = await db(tables.items).update(updateData).where({id:data.itemId, res_id:data.restaurantId});
        return query;
    }

    async removeItem(data) {
        let query = await db(`${tables.items}`).where({id:data.itemId, res_id:data.restaurantId}).del();
        return query;
    }

}

let restaurantModel = new RestaurantModel();
module.exports = restaurantModel;