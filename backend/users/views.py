from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from backend.db import db  # MongoDB kapcsolat

from users.auth import MongoDBJWTAuthentication
from bson import ObjectId

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import bcrypt

@method_decorator(csrf_exempt, name='dispatch') # CSRF védelem kikapcsolása

# TESZT JWT TOKENHEZ
class ProtectedView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id  # Django most már tudja kezelni, mert MongoDBUser objektumot adunk vissza

        if not user_id:
            return Response({"error": "User ID missing from token"}, status=status.HTTP_400_BAD_REQUEST)

        users_collection = db["users"]

        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return Response({"error": "Invalid user ID format"}, status=status.HTTP_400_BAD_REQUEST)

        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "message": "Sikeresen elérted a védett végpontot!",
            "user": user["username"]
        })

class RegisterView(APIView):
    def post(self, request):
        users_collection = db["users"]

        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            return Response({"error": "All fields are required!"}, status=status.HTTP_400_BAD_REQUEST)

        if users_collection.find_one({"username": username}):
            return Response({"error": "This username is already taken!"}, status=status.HTTP_400_BAD_REQUEST)
        
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

        new_user = {
            "username": username,
            "email": email,
            "password": hashed_password
        }

        result = users_collection.insert_one(new_user)
        user_id = str(result.inserted_id) # Stringként tároljuk az ObjectId-t a tokenhez

        return Response({
            "message": "Registration successful!",
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        users_collection = db["users"]

        username = request.data.get("username")
        password = request.data.get("password")

        # Lekérjük a felhasználót MongoDB-ből
        user = users_collection.find_one({"username": username})

        if not user:
            return Response({"error": "Invalid username or password!"}, status=status.HTTP_400_BAD_REQUEST)

        # Jelszó ellenőrzése bcrypt-tel
        if not bcrypt.checkpw(password.encode(), user["password"].encode()):
            return Response({"error": "Invalid username or password!"}, status=status.HTTP_400_BAD_REQUEST)

        # JWT Token manuális létrehozása
        refresh = RefreshToken()
        refresh["user_id"] = str(user["_id"])  # MongoDB ObjectId stringként tárolása
        refresh["username"] = user["username"]

        access_token = str(refresh.access_token)  # Access token generálása

        return Response({
            "message": "Sikeres bejelentkezés!",
            "access": access_token,  # Access token visszaadása
            "refresh": str(refresh),  # Refresh token visszaadása
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"]
            }
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    def post(self, request):
        return Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)