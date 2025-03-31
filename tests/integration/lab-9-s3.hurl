# s3 test
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`Hello S3!`

# We should get back a 201 response
HTTP/1.1 201
[Captures]
url: header "Location"

# GET the fragment created
GET {{url}}
[BasicAuth]
user1@email.com:password1

# confirm server returns 200, type, and body equals the same
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello S3!"

# DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# confirm server returns 200
HTTP/1.1 200

# GET the fragment deleted and it should return 404
GET {{url}}
[BasicAuth]
user1@email.com:password1

# confirm server returns 404
HTTP/1.1 404
