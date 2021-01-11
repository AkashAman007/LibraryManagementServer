# Library Server

The library management server is written in nodeJs and powered by express. Typescript along with inversifyJs is used to provide complie time safety and follow good OO priniciples.

InversifyJS is a lightweight inversion of control (IoC) container for TypeScript and JavaScript apps

## Technologies Used In The Application

1. MySql
2. NodeJs written in Typescript
3. ExpressJs
4. InversifyJs

## Install Dependencies

1. Install node.js and npm. The node version used for this project is v12.8.1
2. Install node modules dependency given in package.json. Inside server directory run
```
npm install
```
3. Install mysql server. MySql Server used for this project is 5.7.31
4. Install typescipt globally using npm
```

npm install -g typescript
```


## Setting Up Environment Variables
The project loads database connection details from Environment Variables. Export the following with the following names

```bash
DB_URL="localhost" #pass your mysql db url here
DB_USERNAME="root" # pass your mysql db username here
DB_PASSWORD="root" # pass your mysql db password here
```


## Starting Server
1. Start mysql server with above credentails
2. start node server in server directory by running command
```
npm start
```

This will compile typescript and create an output folder in **built/** \
It will also make Database Connection with mysql and initialize data in the db.\
It will run on port **7777**

## Testing
The test is written using **mocha**, **chai** and **supertest**.\
Code coverage is done using **nyc**(istanbuljs)\
For this project, the server uses same db connection. So make sure the mysql server is up and running\
To run test, run command
```
npm test
```
This will run test and open code coverage to further investigate 


## Project Structure
All the classes are inside src/ folder
- **controllers**\
Classes that serves as request handler\
Functions are decorated with releative route path\
The controller does basic request validation and passes it to service for business logic handling

- **services**\
Service class performs businsess logic on request and returns appropriate response\
In case of an exception, it throws Business exception, that is caught by error handler middleware and proper response is sent in that case.\
Services have mapper that deals with database operations

- **mappers**\
Mapper class prepares statement that needs to be executed using database-service class\
After operation is done, it returns response in a model class

- **models**\
Model classes holds result from database

- **common**
  - **db**\
  database-service class holds connetion object and allows execury to be executed either standalone or in transaction with rollback functionality.
  - **exceptions**\
  Has all Custom Exception classes
  - **middeware**\
  Custom middlewares for express server is stored here.\
  error-handler.ts is used to inspect Exception thrown and prepare response object in case of invalid operations
  - **other configuration files**\
Other configuration files such as ContainerConfiguration, logger and utils such as constants and response-helper is kept here

- **test**\
Has all the test files for testing functionalities related to each api

## Database Design

### Tables
- **users** -> has library member information
- **books** -> has book information and available quantity
- **books_borrowed** ->has information of all the books that's been borrowed by user

## Handling Race Condition
There's a possibility of race condition if parallel calls are made for borrow and return book api. This has been handled by making updates to different tables in a transaction with versioning.

## Assumptions
- User Login System has not been implemented. So using a prefilled user to validate request for user
- Database Credentials and other Configuration values are usually stored in vault and zookeeper. Storing here either in constant files or in environment variables.
- montoring is not implelmented in the project, which is usually done using statsd to moinitor api latencies, request counts, errors and other metrics
