from django.contrib.auth.decorators import login_required
from django.urls import path

from User import views

app_name = 'User'

urlpatterns = [
    # path('', views.Index, name='index'),
    # path('user/', views.UserIndexView, name='UserIndexView')
    path('profile/', login_required(views.ProfileIndexView.as_view()), name='ProfileIndexView'),
    path('profile/edit', login_required(views.EditProfileView.as_view()), name='EditProfileView'),
    path('profile/dashboard/<int:id_test>', login_required(views.DashboardView), name='DashboardView'),
    path('profile/test-detail/<int:id_do_test>', login_required(views.TestDetailView), name='TestDetailView'),
]