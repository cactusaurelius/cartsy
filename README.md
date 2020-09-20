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

## Get list of Things again

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

## Change a Thing's state

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

## Get changed Thing

### Request

`GET /thing/id`

    curl -i -H 'Accept: application/json' http://localhost:7000/thing/1

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:31 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 40

    {"id":1,"name":"Foo","status":"changed"}

## Change a Thing

### Request

`PUT /thing/:id`

    curl -i -H 'Accept: application/json' -X PUT -d 'name=Foo&status=changed2' http://localhost:7000/thing/1

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:31 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 41

    {"id":1,"name":"Foo","status":"changed2"}

## Attempt to change a Thing using partial params

### Request

`PUT /thing/:id`

    curl -i -H 'Accept: application/json' -X PUT -d 'status=changed3' http://localhost:7000/thing/1

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:32 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 41

    {"id":1,"name":"Foo","status":"changed3"}

## Attempt to change a Thing using invalid params

### Request

`PUT /thing/:id`

    curl -i -H 'Accept: application/json' -X PUT -d 'id=99&status=changed4' http://localhost:7000/thing/1

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:32 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 41

    {"id":1,"name":"Foo","status":"changed4"}

## Change a Thing using the _method hack

### Request

`POST /thing/:id?_method=POST`

    curl -i -H 'Accept: application/json' -X POST -d 'name=Baz&_method=PUT' http://localhost:7000/thing/1

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:32 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 41

    {"id":1,"name":"Baz","status":"changed4"}

## Change a Thing using the _method hack in the url

### Request

`POST /thing/:id?_method=POST`

    curl -i -H 'Accept: application/json' -X POST -d 'name=Qux' http://localhost:7000/thing/1?_method=PUT

### Response

    HTTP/1.1 404 Not Found
    Date: Thu, 24 Feb 2011 12:36:32 GMT
    Status: 404 Not Found
    Connection: close
    Content-Type: text/html;charset=utf-8
    Content-Length: 35

    {"status":404,"reason":"Not found"}

## Delete a Thing

### Request

`DELETE /thing/id`

    curl -i -H 'Accept: application/json' -X DELETE http://localhost:7000/thing/1/

### Response

    HTTP/1.1 204 No Content
    Date: Thu, 24 Feb 2011 12:36:32 GMT
    Status: 204 No Content
    Connection: close


## Try to delete same Thing again

### Request

`DELETE /thing/id`

    curl -i -H 'Accept: application/json' -X DELETE http://localhost:7000/thing/1/

### Response

    HTTP/1.1 404 Not Found
    Date: Thu, 24 Feb 2011 12:36:32 GMT
    Status: 404 Not Found
    Connection: close
    Content-Type: application/json
    Content-Length: 35

    {"status":404,"reason":"Not found"}

## Get deleted Thing

### Request

`GET /thing/1`

    curl -i -H 'Accept: application/json' http://localhost:7000/thing/1

### Response

    HTTP/1.1 404 Not Found
    Date: Thu, 24 Feb 2011 12:36:33 GMT
    Status: 404 Not Found
    Connection: close
    Content-Type: application/json
    Content-Length: 35

    {"status":404,"reason":"Not found"}

## Delete a Thing using the _method hack

### Request

`DELETE /thing/id`

    curl -i -H 'Accept: application/json' -X POST -d'_method=DELETE' http://localhost:7000/thing/2/

### Response

    HTTP/1.1 204 No Content
    Date: Thu, 24 Feb 2011 12:36:33 GMT
    Status: 204 No Content
    Connection: close

