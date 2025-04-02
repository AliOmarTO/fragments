# dynamodb test
POST http://localhost:8080/v1/fragments
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1
{
  "service": "DynamoDB"
}

# We should get back a 201 response
HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1-id: jsonpath "$.fragment.id"

# GET the fragment info for fragment created
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1
# confirm server returns 200, type, and body equals the same
HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "success"
jsonpath "$.fragment.id" == "{{fragment1-id}}"
jsonpath "$.fragment.type" == "application/json"


# POST second markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown; charset=utf-8
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**`
# We should get back a 201 response
HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2-id: jsonpath "$.fragment.id"

# GET the fragment info for fragment created
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1
# confirm server returns 200, type, and body equals the same
HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "success"
jsonpath "$.fragment.id" == "{{fragment2-id}}"
jsonpath "$.fragment.type" == "text/markdown"

# GET all the fragments for the same authorized user without expanding
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
# confirm server returns 200, type, and body equals the same
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" contains "{{fragment1-id}}", "{{fragment2-id}}"

# DELETE the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
# confirm server returns 200
HTTP/1.1 200

# GET the fragment deleted and it should return 404
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
# confirm server returns 404
HTTP/1.1 404

# GET all the fragments and confirm first is not included but second is
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
# confirm server returns 200, type, and body equals the same
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" contains "{{fragment2-id}}"
jsonpath "$.fragments" not contains "{{fragment1-id}}"







