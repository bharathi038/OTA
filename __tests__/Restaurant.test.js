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

describe("Restaurant API Test Suites" ,()=>{
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

    describe("Update order status" ,()=>{

        
        test("Update order status expected success", async()=>{


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
            
            // Clone event
            let awsEvent3 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent3.httpMethod = 'PATCH';
            awsEvent3.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent3.pathParameters.fn = 'restaurant/1/order/'+body2.orderId;
            awsEvent3.path = '/'+awsEvent3.pathParameters.fn;
            awsEvent3.body = JSON.stringify({status:"PREPARING"});

            let res3 = await handler.request(awsEvent3);
            let body3 = JSON.parse(res3.body);
            if(body3.error){
                console.error(body3)
            }
            expect(res3.statusCode).toBe(200);

        })



        test("Update order with invalid order id expected failure", async()=>{


            // Clone event
            let awsEvent3 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent3.httpMethod = 'PATCH';
            awsEvent3.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent3.pathParameters.fn = 'restaurant/1/order/7841458974587854';
            awsEvent3.path = '/'+awsEvent3.pathParameters.fn;
            awsEvent3.body = JSON.stringify({status:"PREPARING"});

            let res3 = await handler.request(awsEvent3);
            let body3 = JSON.parse(res3.body);
            if(body3.error){
                console.error(body3)
            }
            expect(res3.statusCode).toBe(400);

        })


        test("Update order with completed status expected failure", async()=>{

            // Clone event
            let awsEvent3 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent3.httpMethod = 'PATCH';
            awsEvent3.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent3.pathParameters.fn = 'restaurant/1/order/1';
            awsEvent3.path = '/'+awsEvent3.pathParameters.fn;
            awsEvent3.body = JSON.stringify({status:"PREPARING"});

            let res3 = await handler.request(awsEvent3);
            let body3 = JSON.parse(res3.body);
            if(body3.error){
                console.error(body3)
            }
            expect(res3.statusCode).toBe(400);

        })
    })

    describe("Get token" ,()=>{

        
        test("Get token expected success", async()=>{

            let awsEvent2 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent2.httpMethod = 'GET';
            awsEvent2.pathParameters.fn = 'restaurant/token';
            awsEvent2.path = '/'+awsEvent2.pathParameters.fn;         
            let res3 = await handler.request(awsEvent2);
            let body = JSON.parse(res3.body);            
            expect(res3.statusCode).toBe(200);

        })
       
    })


    describe("Mange items" ,()=>{

        test("Get items expected success", async()=>{

            let awsEvent2 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent2.httpMethod = 'GET';
            awsEvent2.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent2.pathParameters.fn = 'restaurant/1/items';
            awsEvent2.queryStringParameters = {page:1};
            awsEvent2.path = '/'+awsEvent2.pathParameters.fn;         
            let res3 = await handler.request(awsEvent2);
            let body = JSON.parse(res3.body);            
            expect(res3.statusCode).toBe(200);

        })


        test("Add new item expected success", async()=>{

            // Clone event
            let awsEvent3 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent3.httpMethod = 'PUT';
            awsEvent3.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent3.pathParameters.fn = 'restaurant/1/item';
            awsEvent3.path = '/'+awsEvent3.pathParameters.fn;
            awsEvent3.body = JSON.stringify({name:"RandomItem -"+Date.now(), category:1, price:519});

            let res3 = await handler.request(awsEvent3);
            let body3 = JSON.parse(res3.body);
            if(body3.error){
                console.error(body3)
            }
            expect(res3.statusCode).toBe(200);

        })


        test("Remove item expected success", async()=>{

            // Clone event
            let awsEvent3 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent3.httpMethod = 'PUT';
            awsEvent3.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent3.pathParameters.fn = 'restaurant/1/item';
            awsEvent3.path = '/'+awsEvent3.pathParameters.fn;
            awsEvent3.body = JSON.stringify({name:"RandomItem -"+Date.now(), category:1, price:519});

            let res3 = await handler.request(awsEvent3);
            let body3 = JSON.parse(res3.body);
            if(body3.error){
                console.error(body3)
            }
            expect(res3.statusCode).toBe(200);

            console.log("body3", body3)
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'DELETE';
            awsEvent.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent.pathParameters.fn = 'restaurant/1/item/'+body3.data.id;
            awsEvent.path = '/'+awsEvent.pathParameters.fn;            

            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(200);

        })

        test("Remove non exist item expected failure", async()=>{

           
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'DELETE';
            awsEvent.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent.pathParameters.fn = 'restaurant/1/item/74514523698547';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;            

            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(400);

        })
        
        test("Update item details expected success", async()=>{

            // Clone event
            let awsEvent3 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent3.httpMethod = 'PATCH';
            awsEvent3.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent3.pathParameters.fn = 'restaurant/1/item/1';
            awsEvent3.path = '/'+awsEvent3.pathParameters.fn;
            awsEvent3.body = JSON.stringify({status:"ACTIVE", name:"5 Leg Pc & 2 Dips Bucket", category:1, price:519, is_available:true});

            let res3 = await handler.request(awsEvent3);
            let body3 = JSON.parse(res3.body);
            if(body3.error){
                console.error(body3)
            }
            expect(res3.statusCode).toBe(200);

        })

        test("Update non exits item expected failure", async()=>{

            // Clone event
            let awsEvent3 = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent3.httpMethod = 'PATCH';
            awsEvent3.headers.Authorization = `JWT ${RES_JWTToken}`;
            awsEvent3.pathParameters.fn = 'restaurant/1/item/7841562479541';
            awsEvent3.path = '/'+awsEvent3.pathParameters.fn;
            awsEvent3.body = JSON.stringify({status:"ACTIVE", name:"5 Leg Pc & 2 Dips Bucket", category:1, price:519, is_available:true});

            let res3 = await handler.request(awsEvent3);
            let body3 = JSON.parse(res3.body);
            if(body3.error){
                console.error(body3)
            }
            expect(res3.statusCode).toBe(400);

        })
       
    })


})

afterAll(async(done) => {
    // Close db connection
    await db.destroy()
    done()
 })