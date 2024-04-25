from django.contrib.auth.decorators import login_required
from django.urls import path, include

from Comment import views

app_name = 'Comment'

urlpatterns = [
    path('test/<int:id_test>', login_required(views.CommentView.as_view()), name='CommentView'),
    path('test/<int:id_test>/post', login_required(views.CommentView.as_view()), name='PostComment'),
    path('test/<int:id_test>/reply', login_required(views.ReplyComment), name='ReplyComment'),
    path('test/<int:id_test>/edit', login_required(views.EditComment), name='EditComment'),
    path('test/<int:id_test>/delete', login_required(views.DeleteComment), name='DeleteComment'),
    path('test/<int:id_test>/like', login_required(views.LikeCmt), name='LikeComment'),
]
