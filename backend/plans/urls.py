from django.urls import path
from .views import PlanView

urlpatterns = [
    path('', PlanView.as_view(), name='plans'),
]
