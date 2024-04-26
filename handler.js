const {match} = require("path-to-regexp");
const jwt = require('jsonwebtoken');

const SecretsManager = require('./config/SecretsManager');
const routes = require('./config/Routes');
const Application = require('./controller/Application');
const controllers = require("./controller/Controllers");
let userModel = require("./model/UserModel")


let application = new Application();

/**
 * 
 * Set secret keys like tokens, api keys in environment
 */
async function setSecretKeys(){

  if(process.env['APP_SECRET_KEYS']){
    console.log("[LOG]", "Application Secret Keys Already Set.")
    return true;
  }

  let smResp = await SecretsManager.getSecret(process.env.SERVERLESS_STAGE && process.env.SERVERLESS_STAGE == 'prod' ? "prod/otaSecretKeys" : "dev/otaSecretKeys", "ap-south-1");
  
  if(smResp){
    for(let k in smResp){
      process.env[k] = smResp;
    }
    process.env['APP_SECRET_KEYS'] = 'SET';
  }
}

/**
 * 
 * @param {*} event - AWS event data passed from apigateway
 * @param {*} context - AWS lambda context object
 * @returns 
 */
exports.request = async function (event, context) {
  try {
    
    //seting secretkeys in environment variable
    await setSecretKeys();

    console.log("[REQUEST]", event.httpMethod, event.path);
    // console.log("[EVENTPAYLOAD]", event)
    const headers = event.headers || {};
    const authorization = headers.authorization || headers.Authorization || ""
    const method = event.httpMethod;
    const urlPath = event.path;
    let pathStr = urlPath;
    let pathParams = {};

    // Check is query params is set
    if (!event.queryStringParameters) {
      event.queryStringParameters = {}
    }

    // Execute only in lambda environment
    if (event.httpMethod && event.resource) {

      // Direct path is not defined
      // dynamic path has to be checked with regex match
      if(!routes[pathStr]){
        //Loop through routes to math the route controller and method
        for(let idx in routes){          
          let _match = match(idx,{ decode: decodeURIComponent });
          let _matchList = _match(urlPath);                
          if(_matchList){
              pathStr = idx;
              // get the dynamic paths informations
              pathParams = {..._matchList.params};
              break;
          }
        }
      }

      //path is not defined in routes
      if(!routes[pathStr]){        
        return application.error({error:"Resouce not found."}, application.config.HTTP_STATUS_CODE.NOT_FOUND)
      }

      let routesConfig = routes[pathStr];

      //Check authorization of the route
      if(routesConfig.authorization && routesConfig.authorization.includes('JWT')){

        //authorization is not set
        if(!authorization){
          return application.error({error:"Unauthorized access."}, application.config.HTTP_STATUS_CODE.UNAUTHORIZED)
        }

        //set authorization method and token
        let [authMethod, token] = authorization.split(" ");
        
        if(!authMethod || authMethod != "JWT"){
          return application.error({error:"Authorization method is not valid."})
        }

        if(!token){
          return application.error({error:"Authorization token is not valid."}, application.config.HTTP_STATUS_CODE.UNAUTHORIZED)
        }

        try {
          //verify JWT token
          let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
          event.jwt = decoded;
          event.token = token;

          //Check session only for user
          if(decoded.userId){
            let isValidSession = await userModel.isSessionValid({userId:decoded.userId, token});

            if(!isValidSession){
              return application.error({error:"Session token is not valid."}, application.config.HTTP_STATUS_CODE.UNAUTHORIZED)
            }
          }
          
          //JWT detail and path details not matched
          if(pathParams && ((pathParams.USERID && decoded.userId != pathParams.USERID) || (pathParams.RESID && decoded.restaurantId != pathParams.RESID))){
            return application.error({error:"This resource is not accessible"}, application.config.HTTP_STATUS_CODE.FORBIDDEN)
          }

        } catch(err) {

          //JWT token is invalid
          if(err.message == "invalid token"){
            return application.error({error:"Authorization token is not valid."}, application.config.HTTP_STATUS_CODE.UNAUTHORIZED)
          }

          // JWT token is expired
          if(err.name == "TokenExpiredError"){
            return application.error({error:"Authorization token is expired, please login again."}, application.config.HTTP_STATUS_CODE.UNAUTHORIZED)
          }

          // JWT token is malformed
          if(err.name == "JsonWebTokenError"){
            return application.error({error:"Authorization token is malformed, please login again."}, application.config.HTTP_STATUS_CODE.UNAUTHORIZED)
          }

          console.error("[ERROR]", JSON.stringify(err))
          return application.error({error:"Authorization token is not valid."}, application.config.HTTP_STATUS_CODE.UNAUTHORIZED)
        }

      }

      // Method is not defined in routes
      if(!routesConfig[method]){
        return application.error({error:"Method not allowed."})
      }


      if(method == "POST" || method == "PUT" || method == "PATCH"){


      //Check if content type is supported by end point
      if (routesConfig['allowedContentType'] && (routesConfig['allowedContentType'].indexOf(headers['Content-Type']||headers['content-type']) == -1 || (!headers['Content-Type'] && !headers['content-type']) ) ) {
        return  application.error(`${pathStr} - ${method} - ${headers['Content-Type'] || headers['content-type']} content type is not allowed`);
      }

      
        // No payload is set
        if(!event.body){          
          return application.error({error:"Payload cannot be empty."})
        }

        try {
          event.body = JSON.parse(event.body);
        } catch (e) {
          console.error("[ERROR]", e)
          return application.error({error:"Payload is malformed."})
        }
      }

      
      event.pathParams = pathParams;

      //Split controller and method name
      let [controllerName, controllerMethod] = routesConfig[method].split(".");

      //Check is controller is set
      if(!controllers[controllerName]){
        return application.error({error:"Controller not set."})
      }

      //Check is method is set in controller
      if(!controllers[controllerName][controllerMethod]){
        return application.error({error:"Controller's method not set."})
      }
      
      //Execute the routes method
      let response = await controllers[controllerName][controllerMethod](event, context);

      if(!response){
        console.log("[LOG]", "Response is not set.");
      }

      console.log("[LOG]", response)

      return response;
    }

    throw "Application Not Running in Lambda";
  } catch (error) {
    console.error("[ERROR]", error);
    return application.error({error:"Internal server error occurred."}, application.config.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
  }
};
