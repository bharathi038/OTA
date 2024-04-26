let Application = require("./Application")
let cartModel = require("../model/CartModel")
const Joi = require('joi')

/**
 * Orde class
 */
class Order extends Application {
    constructor() {
        super();
    }

    /**
     * View users order with pagination
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async view(event, context) {
        let {pathParams, queryStringParameters={}, jwt} = event;
        
        const validateSchema = Joi.object({
            USERID: Joi.number().min(1).required(),            
            page: Joi.number().min(1).required()
        })
        
        let validatedData = validateSchema.validate({...pathParams, page:queryStringParameters.page});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let orders = await cartModel.getOrders(jwt.userId, queryStringParameters.page-1);

        return this.response({data:orders});
    }

    /**
     * Get Users individual order
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async getOrder(event, context) {
        let {pathParams, queryStringParameters={}, jwt} = event;
        
        const validateSchema = Joi.object({
            USERID: Joi.number().min(1).required(),            
            ORDERID: Joi.number().min(1).required()
        })
        
        let validatedData = validateSchema.validate({...pathParams});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let order = await cartModel.getOrder(jwt.userId, pathParams.ORDERID);

        return this.response({data:order});
    }

    /**
     * View users active orders which is not completed
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async currentOrder(event, context) {
        let {pathParams, queryStringParameters={}, jwt} = event;
        
        const validateSchema = Joi.object({
            USERID: Joi.number().min(1).required()
        })
        
        let validatedData = validateSchema.validate({...pathParams});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let order = await cartModel.getAcceptedOrder(jwt.userId);

        return this.response({data:order});
    }

    /**
     * Update order status by restaurant
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async updateOrderStatus(event, context) {
        let {pathParams, queryStringParameters={}, jwt, body} = event;
        
        const validateSchema = Joi.object({
            RESID: Joi.number().min(1).required(),            
            ORDERID: Joi.number().min(1).required(),
            status: Joi.string().valid('COMPLETED','PREPARING')
        })
        
        let validatedData = validateSchema.validate({...pathParams, ...body});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let orderDetail = await cartModel.getOrderByRestaurantId(pathParams.RESID, pathParams.ORDERID);
        if(!orderDetail.length){
            return this.error({error:"This order doesn't exists."});
        }  
        
        if(orderDetail[0].status ==="COMPLETED"){
            return this.error({error:"This order is in completed state. Status cannot be changed."});
        }

        let isUpdated = await cartModel.updateOrderStatus({...body, restaurantId:pathParams.RESID, orderId:pathParams.ORDERID});        
        
        if(!isUpdated){
            return this.error({error:"Unable to update the order status."});
        }
        return this.response({message:"Order status updated."});
    }

}

let order = new Order();
module.exports = order;