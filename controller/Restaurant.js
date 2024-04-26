let Application = require("./Application")
let restaurantModel = require("../model/RestaurantModel")
const Joi = require('joi')
const jwt = require('jsonwebtoken');

/**
 * Restaurant Class
 */
class Restaurant extends Application {
    constructor() {
        super();
    }
    
    /**
     * Get restaurant jwt token
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async getToken(event, context) {
        
        let restaurantDetail = await restaurantModel.getRestaurantDetail();

        if(!restaurantDetail){
            return this.error({error:"Unable to get restaurant detail."});
        }

        
        let dateNowTs = Math.floor(Date.now()/1000);
        let data = {
            restaurantId:restaurantDetail.id,
            name:restaurantDetail.name,
            iat: dateNowTs,
            exp: dateNowTs+this.config.jwtTokenExpiresIn*10, //Keeping to 10 days for test run
        }
        let token = jwt.sign(data, process.env.JWT_SECRET_KEY);
        
        return this.response({token, data:restaurantDetail})
    }

    /**
     * Get restaurant's items
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async viewItems(event, context) {
        let {pathParams, queryStringParameters={}, jwt} = event;
        
        const validateSchema = Joi.object({
            RESID: Joi.number().min(1).required(),            
            page: Joi.number().min(1).required()
        })

        console.log(queryStringParameters)
        
        let validatedData = validateSchema.validate({...pathParams, page:queryStringParameters.page});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let items = await restaurantModel.getItems(jwt.restaurantId, queryStringParameters.page-1);

        return this.response({data:items});
    }

    /**
     * Add menu items  
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async addItem(event, context) {
        let {pathParams, queryStringParameters={}, jwt, body} = event;
        
        const validateSchema = Joi.object({
            RESID: Joi.number().min(1).required(),            
            name: Joi.string().trim().pattern(/[a-zA-z0-9 &-_]/).min(3).max(100).required(),
            category: Joi.number().min(1).required(),
            price: Joi.number().min(0.10).max(9999).required(),
        })
        
        let validatedData = validateSchema.validate({...pathParams, ...body});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let isItemNameExists = await restaurantModel.isItemNameExists({...body, restaurantId:pathParams.RESID});
        if(isItemNameExists){
            return this.error({error:"This item name already exists."});
        }

        let itemId = await restaurantModel.addItem({...body, restaurantId:pathParams.RESID});
        let item = await restaurantModel.getItem(itemId);

        return this.response({message:"Item Is added.",data:item});
    }


    /**
     * Update menu items details
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async updateItem(event, context) {
        let {pathParams, queryStringParameters={}, jwt, body} = event;
        
        const validateSchema = Joi.object({
            RESID: Joi.number().min(1).required(),            
            ITEMID: Joi.number().min(1).required(),
            name: Joi.string().pattern(/[a-zA-Z0-9 -_&]/).min(3).max(100),
            category: Joi.number().min(1),
            price: Joi.number().min(0.10).max(9999),
            is_available: Joi.boolean(),
            status: Joi.string().valid('ACTIVE','DELETED')
        })
        
        let validatedData = validateSchema.validate({...pathParams, ...body});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let isItemExists = await restaurantModel.getItem(pathParams.ITEMID);
        if(!isItemExists){
            return this.error({error:"This item doesn't exists."});
        }        

        let isUpdated = await restaurantModel.updateItem({...body, restaurantId:pathParams.RESID, itemId:pathParams.ITEMID});        
        
        if(!isUpdated){
            return this.error({error:"Unable to update the item."});
        }

        let item = await restaurantModel.getItem(pathParams.ITEMID);

        return this.response({message:"Item Is updated.", data:item});
    }

    /**
     * Remove Items from menu
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async removeItem(event, context) {
        let {pathParams, queryStringParameters={}, jwt, body} = event;
        
        const validateSchema = Joi.object({
            RESID: Joi.number().min(1).required(),            
            ITEMID: Joi.number().min(1).required()
        })
        
        let validatedData = validateSchema.validate({...pathParams, ...body});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let isRemoved = await restaurantModel.removeItem({restaurantId:pathParams.RESID, itemId:pathParams.ITEMID});        
        
        if(!isRemoved){
            return this.error({error:"Item doesn't exists."});
        }

        return this.response({message:"Item is removed."});
    }

}

let restaurant = new Restaurant();
module.exports = restaurant;