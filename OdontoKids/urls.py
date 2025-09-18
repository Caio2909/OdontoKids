from django.urls import path
from core import views

urlpatterns = [
    # Páginas
    path('', views.index, name='index'),

    # API de Autenticação
    path('api/register/', views.register_view, name='api_register'),
    path('api/login/', views.login_view, name='api_login'),
    path('api/logout/', views.logout_view, name='api_logout'),

    # API de Dados
    path('api/user-data/', views.get_user_data_view, name='api_user_data'),
    path('api/avatar/', views.handle_avatar_view, name='api_avatar'),
    path('api/assessment/', views.save_assessment_view, name='api_assessment'),
]
