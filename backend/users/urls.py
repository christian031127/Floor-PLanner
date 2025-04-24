from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProtectedView, CustomRefreshView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    # path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('protected/', ProtectedView.as_view(), name='test_protected'),  # ÚJ VÉGPONT TESZTELÉSHEZ
    path('refresh-token/', CustomRefreshView.as_view(), name='custom_refresh'),
]


