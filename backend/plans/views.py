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

        plan_id = request.query_params.get("id")

        if plan_id:
            plan = plans_collection.find_one({
                "_id": ObjectId(plan_id),
                "user_id": ObjectId(user_id)
            })

            if not plan:
                return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

            plan["_id"] = str(plan["_id"])
            plan["user_id"] = str(plan["user_id"])

            return Response(plan, status=status.HTTP_200_OK)

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

        walls = request.data.get("walls", [])
        elements = request.data.get("elements", []) 
        objects = request.data.get("objects", [])

        plan_doc = {
            "user_id": ObjectId(user_id),
            "name": name,
            "walls": walls,
            "elements": elements,
            "objects": objects
        }

        result = db["plans"].insert_one(plan_doc)

        return Response({
            "id": str(result.inserted_id),
            "name": name,
            "message": "Plan successfully created!"
        }, status=status.HTTP_201_CREATED)
    
    def patch(self, request):
        user_id = request.user.id
        plan_id = request.data.get("id")

        if not plan_id:
            return Response({"error": "Plan ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        update_fields = {}
        for field in ["name", "walls", "elements", "objects"]:
            if field in request.data:
                update_fields[field] = request.data[field]

        if not update_fields:
            return Response({"error": "No fields to update"}, status=status.HTTP_400_BAD_REQUEST)

        result = db["plans"].update_one(
            {"_id": ObjectId(plan_id), "user_id": ObjectId(user_id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return Response({"error": "Plan not found or not yours"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Plan updated successfully"}, status=status.HTTP_200_OK)

    def delete(self, request):
        plan_id = request.data.get("id")
        if not plan_id:
            return Response({"error": "Plan ID required"}, status=status.HTTP_400_BAD_REQUEST)

        db["plans"].delete_one({"_id": ObjectId(plan_id)})
        return Response({"message": "Plan deleted"}, status=status.HTTP_200_OK)
