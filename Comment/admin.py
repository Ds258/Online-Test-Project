from django.contrib import admin

from Comment.models import LikeComment, TestComment

# Register your models here.
admin.site.register(TestComment)
admin.site.register(LikeComment)
