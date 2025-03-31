from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class MongoDBUser:
    def __init__(self, user_id):
        self.id = user_id
        self.is_authenticated = True  # Django ezt várja el a hitelesített felhasználótól

class MongoDBJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None
        
        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user_id = validated_token.get("user_id")

        if not user_id:
            raise AuthenticationFailed("User ID missing in token")

        return MongoDBUser(user_id), validated_token  # Most egy Django kompatibilis user osztályt adunk vissza
