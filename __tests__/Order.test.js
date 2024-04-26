const handler = require('../handler');
const db = require('../config/db');
const matchers = require('jest-json-schema').matchers;
expect.extend(matchers);

let defaultApiEvent = {
    "body": null,
    "headers": {
        "Host": "localhost:3000",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36",
        "Sec-Fetch-User": "?1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,fr;q=0.7,fr-CA;q=0.6,fr-FR;q=0.5,fr-CH;q=0.4"        
    },
    "httpMethod": "GET", // Give method GET|POST
    "path": "/examplepath",
    "pathParameters": {
        "fn": "examplepath"
    },
    "queryStringParameters": {
       
    },
    "resource": "/{fn}", // check on yml file
    "stageVariables": null,
    "isOffline": true
}

describe("Order API Test Suites" ,()=>{
    let JWTToken;
    let RES_JWTToken;
    jest.setTimeout(30000);

    beforeAll(async () => {

        let userDetails = {                
            password:"passWord!123",                
            emailId:`random1713961569252@samplemail.com`,
        };            
        
        // Clone event
        let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
        awsEvent.httpMethod = 'POST';
        awsEvent.pathParameters.fn = 'user/login';
        awsEvent.path = '/'+awsEvent.pathParameters.fn;
        awsEvent.body = JSON.stringify({                
            password:userDetails.password,                
            emailId:userDetails.emailId,
        });
        let loginRes = await handler.request(awsEvent);
        let loginBody = JSON.parse(loginRes.body);
        if(loginBody.token){
            JWTToken = loginBody.token
        }

         // Clone event
         let awsEvent2 = JSON.parse(JSON.stringify(defaultApiEvent));
         awsEvent2.httpMethod = 'GET';
         awsEvent2.pathParameters.fn = 'restaurant/token';
         awsEvent2.path = '/'+awsEvent2.pathParameters.fn;         
         let loginRes2 = await handler.request(awsEvent2);
         let loginBody2 = JSON.parse(loginRes2.body);
         if(loginBody2.token){
            RES_JWTToken = loginBody2.token
         }

    });

    describe("View Users Orders" ,()=>{

        test("list all orders expected success", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'GET';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/orders';
            awsEvent.queryStringParameters = {page:1};
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(200);

        })

        test("Get active orders expected success", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'GET';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/activeOrder';
            awsEvent.queryStringParameters = {page:1};
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(200);

        })

        test("View order expected success", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'GET';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/order/22';
            awsEvent.queryStringParameters = {page:1};
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(200);

        })



    })

})

afterAll(async(done) => {
    // Close db connection
    await db.destroy()
    done()
 })