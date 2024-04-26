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

describe("User API Test Suites" ,()=>{
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

    describe("User Registration" ,()=>{

        test("Create new user account expected success", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'PUT';
            awsEvent.pathParameters.fn = 'user/register';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            awsEvent.body = JSON.stringify({
                name:"Peter Pan",
                password:"passWord!123",
                mobileNo:String(Math.floor(Date.now()/1000)),
                emailId:`random${Date.now()}@samplemail.com`,
            });
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);
            if(body.error){
                console.error(body)
            }
            expect(res.statusCode).toBe(201);
            expect(body).toMatchSchema({
                required: ["data"],
                properties:{
                    data:{ type:'object', required: ["userId","emailId","name","mobileNo"], properties:{
                        userId:{type:'number'},
                        emailId:{type:'string'},
                        name:{type:'string'},
                        mobileNo:{type:'string'},
                    } }
                }
            });
        })

        test("Create new user account expected failure", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'PUT';
            awsEvent.pathParameters.fn = 'user/register';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            awsEvent.body = JSON.stringify({
                name:"Peter Pan",
                password:"",
                mobileNo:String(Math.floor(Date.now()/1000)),
                emailId:`random${Date.now()}@samplemail.com`,
            });
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);            
            expect(res.statusCode).toBe(400);
            expect(body).toMatchSchema({
                required: ["error"],
                properties:{
                    error:{ type:'string'}
                }
            });
        })
    })

    describe("User Login and Logout" ,()=>{

        test("User Login expected success", async()=>{

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
            if(loginBody.error){
                console.error(body)
            }
            expect(loginRes.statusCode).toBe(200);
        })


        test("User Logout expected success", async()=>{
            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'GET';
            awsEvent.headers.Authorization = `JWT ${JWTToken}`;
            awsEvent.pathParameters.fn = 'user/logout';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;               
            let res = await handler.request(awsEvent);                
            expect(res.statusCode).toBe(200);                
        })

        test("User Login expected failure", async()=>{

            let userDetails = {                
                password:String(Date.now()),
                emailId:`random${Date.now()}@samplemail.com`,
            };

            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.httpMethod = 'POST';
            awsEvent.pathParameters.fn = 'user/login';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;
            awsEvent.body = JSON.stringify(userDetails);
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);            
            expect(res.statusCode).toBe(400);

        })

        test("User session token expired expected failure", async()=>{

            // Clone event
            let awsEvent = JSON.parse(JSON.stringify(defaultApiEvent));
            awsEvent.headers.Authorization = `JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsIm5hbWUiOiJQZXRlciBQYW4iLCJpYXQiOjE3MTM4OTY2NjMsImV4cCI6MTcxMzk4MzA2M30.l_EZmHjIxKumlysuLs72M_0NPA1R45UTR4QNapmZ628`;
            awsEvent.httpMethod = 'GET';
            awsEvent.pathParameters.fn = 'user/7/cart';
            awsEvent.path = '/'+awsEvent.pathParameters.fn;            
            let res = await handler.request(awsEvent);
            let body = JSON.parse(res.body);            
            expect(res.statusCode).toBe(401);

        })
        
    })
    

})

afterAll(async(done) => {
    // Close db connection
    await db.destroy()
    done()
 })