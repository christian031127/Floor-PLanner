from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from backend.db import db
from bson import ObjectId
from users.auth import MongoDBJWTAuthentication

class PlanView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        plans_collection = db["plans"]
        user_plans = plans_collection.find({"user_id": ObjectId(user_id)})

        plans = [{
            "id": str(plan["_id"]),
            "name": plan["name"]
        } for plan in user_plans]

        return Response(plans, status=status.HTTP_200_OK)

    def post(self, request):
        user_id = request.user.id
        name = request.data.get("name")

        if not name:
            return Response({"error": "Name is required!"}, status=status.HTTP_400_BAD_REQUEST)

        plan_doc = {
            "user_id": ObjectId(user_id),
            "name": name
        }

        result = db["plans"].insert_one(plan_doc)

        return Response({
            "id": str(result.inserted_id),
            "name": name,
            "message": "Plan successfully created!"
        }, status=status.HTTP_201_CREATED)
    
    def patch(self, request):
        plan_id = request.data.get("id")
        new_name = request.data.get("name")
        if not plan_id or not new_name:
            return Response({"error": "Missing data"}, status=status.HTTP_400_BAD_REQUEST)

        db["plans"].update_one({"_id": ObjectId(plan_id)}, {"$set": {"name": new_name}})
        return Response({"message": "Plan name updated"}, status=status.HTTP_200_OK)

    def delete(self, request):
        plan_id = request.data.get("id")
        if not plan_id:
            return Response({"error": "Plan ID required"}, status=status.HTTP_400_BAD_REQUEST)

        db["plans"].delete_one({"_id": ObjectId(plan_id)})
        return Response({"message": "Plan deleted"}, status=status.HTTP_200_OK)
