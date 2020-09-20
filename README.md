# Simple cart app with Users, Products and Carts functionality

This App is built with Moleculer microservices, Elasticsearch as a database, Redis for caching.

## Install

    npm install

## Run the app

    npm run dev

## Run the tests

    npm run test

# REST API

The REST API to the example app is described below.

## Create a new User

### Request

`POST /users/create`

    curl --location --request POST 'http://localhost:5004/users/create' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "user": {
            "username": "abdozak",
            "password": "123456789",
            "email": "abdo.zak.ams@gmail.com"
        }
    }'

### Response

    HTTP/1.1 200 Ok

    {
    "_index": "users",
    "_type": "user",
    "_id": "axCCrHQB_M4gtWtjTXPU",
    "_version": 1,
    "result": "created",
    "_shards": {
        "total": 2,
        "successful": 1,
        "failed": 0
    },
    "_seq_no": 0,
    "_primary_term": 1
    }

## Login

### Request

`GET /users/login`

    curl --location --request POST 'http://localhost:5004/users/login' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "user": {
            "username": "abdozak",
            "password": "123456789",
            "email": "abdo.zak.ams@gmail.com"
        }
    }'

### Response

    HTTP/1.1 200 OK

    {
    "user": {
        "username": "abdozak",
        "email": "abdo.zak.ams@gmail.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImF4Q0NySFFCX000Z3RXdGpUWFBVIiwiZW1haWwiOiJhYmRvLnphay5hbXNAZ21haWwuY29tIiwiZXhwIjoxNjA1ODA2MjgzLCJpYXQiOjE2MDA2MjIyODN9.Nn2E-aVPFfeiq_ytBa3ovJ0pgO_6-xqFQLHHNmpnAm4"
        }
    }
    
## Get existing user

### Request

`GET /user`

    curl --location --request GET 'http://localhost:5004/user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImF4Q0NySFFCX000Z3RXdGpUWFBVIiwiZW1haWwiOiJhYmRvLnphay5hbXNAZ21haWwuY29tIiwiZXhwIjoxNjA1ODA2MjgzLCJpYXQiOjE2MDA2MjIyODN9.Nn2E-aVPFfeiq_ytBa3ovJ0pgO_6-xqFQLHHNmpnAm4' \

### Response

    HTTP/1.1 404 Not Found

    {
    "user": {
        "username": "abdozak",
        "email": "abdo.zak.ams@gmail.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImF4Q0NySFFCX000Z3RXdGpUWFBVIiwiZW1haWwiOiJhYmRvLnphay5hbXNAZ21haWwuY29tIiwiZXhwIjoxNjA1ODA2MjgzLCJpYXQiOjE2MDA2MjIyODN9.Nn2E-aVPFfeiq_ytBa3ovJ0pgO_6-xqFQLHHNmpnAm4"
        }
    }

## Create Product

### Request

`POST /thing/`

    curl --location --request POST 'http://localhost:3000/products/create' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImF4Q0NySFFCX000Z3RXdGpUWFBVIiwiZW1haWwiOiJhYmRvLnphay5hbXNAZ21haWwuY29tIiwiZXhwIjoxNjA1ODA2MjgzLCJpYXQiOjE2MDA2MjIyODN9.Nn2E-aVPFfeiq_ytBa3ovJ0pgO_6-xqFQLHHNmpnAm4' \
    --header 'Content-Type: application/json' \
    --data-raw '{   "product": {
            "sku":"9876543212",
            "data": {
                "title": "shoes"
                }
            }
        }'

### Response

    HTTP/1.1 200 Created
    
    {
        "_index": "products",
        "_type": "product",
        "_id": "9876543212",
        "_version": 1,
        "result": "created",
        "_shards": {
            "total": 2,
            "successful": 1,
            "failed": 0
        },
        "_seq_no": 0,
        "_primary_term": 1
    }

## Get Product

### Request

`GET /thing/`

    curl -i -H 'Accept: application/json' http://localhost:7000/thing/

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:31 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 74

    [{"id":1,"name":"Foo","status":"new"},{"id":2,"name":"Bar","status":null}]

## Add to cart

### Request

`PUT /thing/:id/status/changed`

    curl -i -H 'Accept: application/json' -X PUT http://localhost:7000/thing/1/status/changed

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:31 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 40

    {"id":1,"name":"Foo","status":"changed"}

