let Application = require("./Application")
let userModel = require("../model/UserModel")
const Joi = require('joi')
const jwt = require('jsonwebtoken');
/**
 * User Class
 */
class User extends Application {
    constructor() {
        super();
    }

    /**
     * Register user
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async register(event, context) {
        let {body} = event;

        const validateSchema = Joi.object({
            name: Joi.string().trim().min(3).max(100).required(),
            password: Joi.string().min(8).max(50).required(),
            mobileNo: Joi.string().length(10).required(),
            emailId: Joi.string().min(4).max(200).email().required(),
        })
        
        let validatedData = validateSchema.validate(body);
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        
        let [isEmailIdExists, isMobileNoExists] = await Promise.all([userModel.isEmailIdExists(body.emailId), userModel.isMobileNoExists(body.mobileNo)]);

        if(isEmailIdExists){
            return this.error({error:"This email id already exists."});
        }

        if(isMobileNoExists){
            return this.error({error:"This mobile number already exists."});
        }

        let userId = await userModel.register(body);
        console.log("userId", userId)
        let userDetails = await userModel.getUserByUserId(userId);
        
        if(userId){
            return this.response({message:"User account is created.", data:userDetails}, this.config.HTTP_STATUS_CODE.CREATED);
        }

        return this.error({error:"Unable to create user account, try again later."});
    }

    /**
     * User Login
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async login(event, context) {

        let {body} = event;

        const validateSchema = Joi.object({
            password: Joi.string().required(),
            emailId: Joi.string().email().required(),
        })
        
        let validatedData = validateSchema.validate(body);
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let isValidUserCredentials = await userModel.isValidUserCredentials(body.emailId, body.password);

        if(!isValidUserCredentials){
            return this.error({error:"Emailid or password is wrong."});
        }

        let userDetails = await userModel.getUserByEmailId(body.emailId);
        let dateNowTs = Math.floor(Date.now()/1000);
        let data = {
            userId:userDetails.userId,
            name:userDetails.name,
            iat: dateNowTs,
            exp: dateNowTs+this.config.jwtTokenExpiresIn,
        }
        let token = jwt.sign(data, process.env.JWT_SECRET_KEY);
        await Promise.all([userModel.storeInSession({userId:data.userId, token:token, expires:data.exp}), userModel.removeOldSession({userId:data.userId, now:dateNowTs})])
        return this.response({message:"Successfully logged in.", token, data:userDetails})
    }

    /**
     * User Logout
     * @param event apigateway event details
     * @param event.body Api payload in JSON format
     * @param event.JWT Users jwt decoded details
     * @param event.token Users jwt token
     * @param event.pathParams URL paths dynamic values
     * @param event.queryStringParameters Query params passed in URL
     * @param {*} context 
     * @returns 
     */
    async logout(event, context) {
       
        const validateSchema = Joi.object({
            userId: Joi.number().required(),
            token: Joi.string().required(),
        })
        
        let validatedData = validateSchema.validate({userId:event.jwt.userId, token: event.token});
        if(validatedData.error){
            return this.error({error:validatedData.error.message});
        }

        let dateNowTs = Math.floor(Date.now()/1000);
        let promiseData = await Promise.all([userModel.removeASession({userId:event.jwt.userId, token: event.token}), userModel.removeOldSession({userId:event.jwt.userId, now:dateNowTs})]);
        console.log(promiseData)
        return this.response({message:"User logged out."})
    }

}

let user = new User();
module.exports = user;