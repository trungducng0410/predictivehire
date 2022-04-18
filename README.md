# predictivehire

### This is a simple REST API application for Full-stack developer interview from Predictivehire

Stories:
1. A user can login with a username and password
2. Return success and a JWT token if username and password are correct
3. Return fail if username and password are not matched
4. A user has a maximum of 3 attempts within 5 minutes, otherwise, the user will be locked.
5. Return fail if a user is locked

#### Important: This application does not contain signup functionality. Please use this test account for testing

```
username = admin@predictivehire.com
password = predictivehire
```

If your account is locked, send a POST request to /v1/reset to reset the account :D
```
curl --request POST \
  --url http://localhost:3000/v1/reset
```

# How to run it

#### Using docker-compose

``` docker-compose up ``` and DONE!

#### Dev environment

Start your own mongoDB instance (port 27017) or using docker

``` docker run --name mongo -p 27017:27017 mongo ```

Use ``` http://localhost:3000/v1/login ``` to test the API

Here is a sample request

```
curl --request POST \
  --url http://localhost:3000/v1/login \
  --header 'Content-Type: application/json' \
  --data '{
	"email": "admin@predictivehire.com",
	"password": "predictivehire"
}'
```

Run following commands

```
npm install
npm install -g typescript (if needed)
npm run dev
```

# How to build it manually
```
npm install
npm run build
```

Output files will be stored in /dist folder
You can run ```npm start``` or ```node dist/index.js``` to run the application

# How to test it
This application was tested using Jest framework. To run the test ``` npm run test ```

Copyright (c) 2022 Trung Duc Nguyen
