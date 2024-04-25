from django.urls import path

from Teacher import views

app_name = 'Teacher'

urlpatterns = [
    path('', views.DashboardIndexView.as_view(), name='DashboardIndexView'),
    path('dashboard/<int:id_test>', views.DashboardView, name='DashboardView'),
    path('list-test/', views.ListTestView, name='ListTestView'),
    path('list-test/page=<int:page>', views.AjaxTest, name='AjaxTest'),
    path('list-test/filter-test', views.SearchTest, name='SearchTest'),

    path('create-quick-test/', views.CreateQuickTestView.as_view(), name='CreateQuickTestView'),
    path('create-test/', views.CreateTestView.as_view(), name='CreateTestView'),
    path('edit-test/<int:id_test>', views.EditTestView.as_view(), name='EditTestView'),
    path('delete-test/<int:id_test>', views.DeleteTestView, name='DeleteTestView'),
    path('edit-test/<int:id_test>/list-question', views.TestListQuesView, name='TestListQuesView'),
    path('edit-test/<int:id_test>/update-question', views.UpdateTestQuesView, name='UpdateTestQuesView'),
    path('edit-test/<int:id_test>/delete-question', views.DeleteTestQuesView, name='DeleteTestQuesView'),

    path('list-question/', views.ListQuestionView, name='ListQuestionView'),
    path('list-question/page=<int:page>', views.AjaxQuestion, name='AjaxQuestion'),
    path('list-question/filter-search', views.SearchQuestion, name='SearchQuestion'),
    # path('list-question/ajax', views.AjaxQuestion, name='AjaxQuestion'),
    path('create-question/', views.CreateQuestionView.as_view(), name='CreateQuestionView'),
    path('edit-question/<int:id_question>', views.EditQuestionView.as_view(), name='EditQuestionView'),
    path('delete-question/<int:id_question>', views.DeleteQuestionView, name='DeleteQuestionView'),
]
