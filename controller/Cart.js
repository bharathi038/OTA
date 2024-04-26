let Application = require("./Application")
let cartModel = require("../model/CartModel")
const Joi = require('joi')
const currency = require('currency.js')

/**
 * Car class
 * Manages carts view, add items, update quantity, remove items and place order
 */
class Cart extends Application {
    constructor() {
        super();
    }

    /**
     * View users cart details
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
            USERID: Joi.number().min(1).required()
        })
        
        let validatedData = validateSchema.validate({...pathParams});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let userCart = await cartModel.getUserCart(jwt.userId);
        let subTotal = userCart.reduce((a,b)=> currency(a).add(b.price**b.qty).value, 0);
        // let userCart = await cartModel.getUserAllCartItems(jwt.userId);

        return this.response({data:userCart, subTotal});
    }


    /**
     * Add items to cart
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
        let {pathParams, queryStringParameters={}, body, jwt} = event;
        
        const validateSchema = Joi.object({
            USERID: Joi.number().min(1).required(),
            ITEMID: Joi.number().min(1).required(),
            qty: Joi.number().min(1).max(999).required(),
            restaurantId: Joi.number().min(1).required(),
        })
        
        let validatedData = validateSchema.validate({...pathParams, ...body});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let [isItemExistsInCart, isItemAvailable] = await Promise.all([cartModel.itemExistsInCart({userId:jwt.userId, itemId:pathParams.ITEMID}), cartModel.isItemAvailable(pathParams.ITEMID)]);

        if(!isItemAvailable){
            return this.error({error:"This item is unavailable to purchase."});
        }

        if(isItemExistsInCart){
            return this.error({error:"This item is already exits in cart."});
        }

        let userCart = await cartModel.upsertItem({itemId:pathParams.ITEMID, userId: jwt.userId, qty:body.qty, restaurantId:body.restaurantId});
        if(!userCart){
            return this.response({message:"Unable to add or update to cart."});    
        }

        return this.response({message:"Item added to cart."},this.config.HTTP_STATUS_CODE.CREATED);
    }

    /**
     * Remove item form cart
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
        let {pathParams, queryStringParameters={}, jwt} = event;
        
        const validateSchema = Joi.object({
            USERID: Joi.number().min(1).required(),
            ITEMID: Joi.number().min(1).required()
        })
        
        let validatedData = validateSchema.validate({...pathParams});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let isRemoved = await cartModel.removeItem(jwt.userId, pathParams.ITEMID);

        if(!isRemoved){
            return this.error({error:"Unable to remove it from cart."});
        }

        return this.response({message:"Item removed from cart."});
    }

    /**
     * Place Order with the items in the cart
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async placeOrder(event, context) {
        let {pathParams, queryStringParameters={}, jwt, body} = event;
        
        const validateSchema = Joi.object({
            USERID: Joi.number().min(1).required()            
        })
        
        let validatedData = validateSchema.validate({...pathParams});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let userCart = await cartModel.getUserAllCartItems(jwt.userId);
        
        if(!userCart.length){
            return this.error({error:"No items in cart to place order."});
        }
        
        let subTotal = userCart.reduce((a,b)=> currency(a).add(b.price*b.qty).value, 0);

        let orderId = await cartModel.addOrder({
            userId:jwt.userId,
            restaurantId:userCart[0].res_id,
            subtotal:subTotal,
            tax_amount:0,
            total:subTotal
        });
        
        let itemsLists = userCart.map(v=>{
            return {
                name:v.name,
                order_id:orderId,
                item_id:v.item_id,
                qty:v.qty,
                price:v.price
            }
        });

        let isItemAdded = await cartModel.addOrderItems(itemsLists);
        let isCartCleared = await cartModel.clearCart(jwt.userId);
        
        return this.response({message:"Order is placed.", orderId:isItemAdded[0]});
    }



}

let cart = new Cart();
module.exports = cart;