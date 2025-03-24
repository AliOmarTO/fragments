# POST without authentication returns a 401 Error
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# 1. We expect to get back an HTTP 401
HTTP/1.1 401

