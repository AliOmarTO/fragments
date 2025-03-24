# Authenticated unsoported POST to confirm that the server returns a 415
POST http://localhost:8080/v1/fragments 
# unsuppoerted content type
Content-Type: application/wrong
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# 1. We expect to get back an HTTP 415
HTTP/1.1 415
