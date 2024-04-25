from django.contrib.auth.decorators import login_required
from django.urls import path, include

from Test import views

app_name = 'Test'

urlpatterns = [
    path('', views.TestIndexView.as_view(), name='TestIndexView'),
    path('<int:id_test>', login_required(views.StartTestView), name='StartTestView'),
    path('save-test/<int:id_do_test>', login_required(views.SaveTestView), name='SaveTestView'),
    path('<int:id_test>/<int:id_do_test>', login_required(views.TakeTestView.as_view()), name='TakeTestView'),
    path('result/<int:id_do_test>', login_required(views.TakeTestView.as_view()), name='TakeTestView'),
    path('mark-favor/<int:id_test>', login_required(views.MarkFavorite), name='MarkFavorite'),
    path('search-test/', views.SearchTest, name='SearchTest'),
]
