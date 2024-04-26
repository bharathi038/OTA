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

describe("Cart API Test Suites" ,()=>{
    let JWTToken;
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

    });

    describe("View Cart Items" ,()=>{

        test("list all cart items expected success", async()=>{


            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'GET';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/cart';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(200);

        })

        test("Invalid token expected failure", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'GET';
            awsEvent.headers.Authorization = `JWT JKiosdfhasdfa7745485as4a4gs8d7f84afa`;
            awsEvent.pathParameters.fn = 'user/1/cart';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(401);
        })

        test("Invalid userId expected failure", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'GET';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/invalidid/cart';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(403);
        })
    })

    describe("Manage Items in Cart" ,()=>{

        test("add item to cart expected success", async()=>{

            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'PUT';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/item/1';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            awsEvent.body = JSON.stringify({                
                qty:2,
                restaurantId:1,
            });

            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(201);

        })

        test("add item to cart expected failure", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'PUT';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/item/200';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            awsEvent.body = JSON.stringify({                
                qty:2,
                restaurantId:1,
            });

            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(400);
        })

        test("remove item from cart expected success", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'DELETE';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/item/1';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;          
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(200);
        })

        test("add item to cart with invalid inputs expected failure", async()=>{

            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'PUT';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/invalidid/item/invaliditem';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            awsEvent.body = JSON.stringify({                
                qty:2,
                restaurantId:1,
            });

            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(403);

        })

        test("remove item from cart with invliad item id expected failure", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'DELETE';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/item/121';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;          
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(400);
        })



    })

    describe("Place Order" ,()=>{

        test("place order expected success", async()=>{

            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'PUT';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/44/item/1';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            awsEvent.body = JSON.stringify({                
                qty:2,
                restaurantId:1,
            });

            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(201);


            // Clone event
            let awsEvent2 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent2.httpMethod = 'PUT';
            awsEvent2.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent2.pathParameters.fn = 'user/44/cart/place_order';
            awsEvent2.path = '/'+awsEvent2.pathParameters.fn;
            awsEvent2.body = JSON.stringify({});

            let res2 = await handler.request(awsEvent2);
            let body2 = JSON.parse(res2.body);
            if(body2.error){
                console.error(body2)
            }
            expect(res2.statusCode).toBe(200);

        })

        test("place order expected failure", async()=>{
            
            // Clone event
            let awsEvent2 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent2.httpMethod = 'PUT';
            awsEvent2.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent2.pathParameters.fn = 'user/44/cart/place_order';
            awsEvent2.path = '/'+awsEvent2.pathParameters.fn;
            awsEvent2.body = JSON.stringify({});

            let res2 = await handler.request(awsEvent2);
            let body2 = JSON.parse(res2.body);
            if(body2.error){
                console.error(body2)
            }
            expect(res2.statusCode).toBe(400);

        })

        test("place order with invalid input expected failure", async()=>{
            
            // Clone event
            let awsEvent2 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent2.httpMethod = 'PUT';
            awsEvent2.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent2.pathParameters.fn = 'user/invalidid/cart/place_order';
            awsEvent2.path = '/'+awsEvent2.pathParameters.fn;
            awsEvent2.body = JSON.stringify({});

            let res2 = await handler.request(awsEvent2);
            let body2 = JSON.parse(res2.body);
            if(body2.error){
                console.error(body2)
            }
            expect(res2.statusCode).toBe(403);

        })

    })

})

afterAll(async(done) => {
    // Close db connection
    await db.destroy()
    done()
 })