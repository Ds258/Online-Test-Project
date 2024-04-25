from django.contrib.auth.decorators import login_required
from django.urls import path

from Practice import views

app_name = 'Practice'

urlpatterns = [
    path('', views.PracticeIndexView.as_view(), name='PracticeIndexView'),
    path('<int:id_test>', views.StartPracticeView, name='StartPracticeView'),
    path('<int:id_test>/<int:id_do_test>', login_required(views.TakePracticeView.as_view()), name='TakePracticeView'),
    path('result/<int:id_do_test>', login_required(views.TakePracticeView.as_view()), name='TakePracticeView'),
]
