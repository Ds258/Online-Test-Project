from django.contrib.auth.views import LogoutView
from django.urls import path, include

from Core import views
from Online_Test_Management import settings

app_name = 'Core'

urlpatterns = [
    # path('', views.Index.as_view(), name='index'),
    path('check-test/', views.CheckTestView, name='CheckTestView'),
    path('cancel-test/<int:id_do_test>', views.CancelTestView, name='CancelTestView'),
    path('', views.Index.as_view(), name='Index'),
    path('login/', views.Login.as_view(), name='Login'),
    path('signup/', views.Signup.as_view(), name='Signup'),
    path('logout/', views.Logout.as_view(), name='Logout'),
]
