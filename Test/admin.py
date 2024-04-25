from django.contrib import admin

from Test.models import Test, DoTest, Subject

# Register your models here.
admin.site.register(Test)
admin.site.register(DoTest)
admin.site.register(Subject)
