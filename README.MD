

## Order Tracking Application

## Run Application In Local
Install all required npm packages by executing `npm install` command in application directory.
To run application in local, execute `npm run start` comman. Application will start to run in `http://localhots:3000/dev` port in local machine.

## Serverless
Serverless framework is used for IaC (Infrastructure as Code). Application end to end infratructure is provided as YAML configuration, refer `serverless.yml` file in application directory. Which used to create AWS Cloudformation for creating and updating stack. For more please visit [Serverless Framework](https://www.serverless.com/framework/docs).

## DB Credentials
Create a new secret key in AWS Secret key Manager for seperate production and developement environment.
`prod/otadb` - Production DB Secret Key.\
`dev/otadb` - Developement DB Secret Key.

Configure following credentials in secret manager
| Key           |   Value       |
| ------------- |:-------------:|
| host          | DB host name or IP address     |
| username      | DB user name     |
| password      | DB user's password     |
| database      | Database name     |

## DB Schema
DB Schema is provided as single sql file `schema and data.sql`.
## Application Secret Keys / API Keys
Create a new secret key in AWS Secret key Manager for seperate production and developement environment.
`prod/otaSecretKeys` - Production DB Secret Key.\
`dev/otaSecretKeys` - Developement DB Secret Key.\
Provide application keys in here, which later will loaded in `process.env`. 

## Deployment Strategies
Blue/Green Deployment will be used to route users by adding weightage to Lambda version. Refer blue/green deployement stratergie this link [Blue/Green Deployment In Aws Lambda](https://www.geeksforgeeks.org/blue-green-deployment-in-aws-lambda/).

## API Document
Please refer `API Document.pdf` file api document.

## Test Suites
Execute `npm run test` command to run test suites.

## Code Coverage
Execute `npm run coverage` command to run code coverage.
