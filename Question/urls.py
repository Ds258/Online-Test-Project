from django.urls import path

from Question import views

urlpatterns = [
    path('', views.QuestionIndexView, name='QuestionIndexView')
]