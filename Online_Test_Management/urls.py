"""
URL configuration for Online_Test_Management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import django
from django.contrib import admin
from django.urls import path


if django.VERSION >= (4, 0):
    from django.urls import include, re_path
else:
    from django.conf.urls import include, url as re_path


urlpatterns = [
    path('admin/', admin.site.urls),
    path("__debug__/", include("debug_toolbar.urls")),
    path('', include('Core.urls')),
    path('test/', include('Test.urls', namespace='Test')),
    path('comment/', include('Comment.urls', namespace='Comment')),
    path('practice/', include('Practice.urls', namespace='Practice')),
    path('user/', include('User.urls', namespace='User')),
    path('teacher/', include('Teacher.urls', namespace='Teacher')),
    path('tz_detect/', include('tz_detect.urls')),

    # path('question/', include('Question.urls', namespace='Question')),
    # path('test/', include('Test.urls', namespace='Test'))
]
