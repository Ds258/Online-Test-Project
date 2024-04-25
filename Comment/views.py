import cloudinary.uploader
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from Comment.models import TestComment, LikeComment, ImageComment
from Comment.serializer import CommentSerializer, ImageSerializer
from Test.models import Test, DoTest
from Test.serializer import TestSerializer


# Create your views here.
class CommentView(APIView):
    def get(self, request, id_test):
        context = {}

        test = Test.objects.filter(id=id_test).first()

        if not test:
            return Response({"status": "test not found"}, status=status.HTTP_404_NOT_FOUND)

        test_serializer = TestSerializer(test).data
        context['test'] = test_serializer

        main_comment = TestComment.objects.filter(id_test=test, id_parent=None).order_by('-created_at')
        comments = CommentSerializer(main_comment, many=True).data
        reply_comment = TestComment.objects.filter(id_test=test, id_parent__in=main_comment).order_by('created_at')
        replies = CommentSerializer(reply_comment, many=True).data

        for cmt in comments:
            like_comment = LikeComment.objects.filter(id_comment__id=cmt['id']).count()
            cmt['num_like'] = like_comment
            if LikeComment.objects.filter(id_comment__id=cmt['id'], id_user=request.user).first():
                cmt['like'] = True
            else:
                cmt['like'] = False

            image_comment = ImageComment.objects.filter(id_comment__id=cmt['id'])
            img_cmt = ImageSerializer(image_comment, many=True).data
            cmt['image'] = img_cmt

        for rep in replies:
            like_reply = LikeComment.objects.filter(id_comment__id=rep['id']).count()
            rep['num_like'] = like_reply
            if LikeComment.objects.filter(id_comment__id=rep['id'], id_user=request.user).first():
                rep['like'] = True
            else:
                rep['like'] = False

            image_reply = ImageComment.objects.filter(id_comment__id=rep['id'])
            img_rep = ImageSerializer(image_reply, many=True).data
            rep['image'] = img_rep

        # Check if user has done the test for the first time
        done_test = DoTest.objects.filter(id_test=test, id_user=request.user).first()
        if done_test is not None:
            context['permission'] = True
        else:
            context['permission'] = False

        for c in comments:
            c['replies'] = []
            for r in replies:
                if c['id'] == r['id_parent']:
                    c['replies'].append(r)

        context['comments'] = comments
        # context['replies'] = replies
        context['id_test'] = id_test
        # return Response(context, status=status.HTTP_202_ACCEPTED)
        return render(request, 'comment/index.html', context)

    # Post comment
    def post(self, request, id_test):
        if request.data:
            # print(request.data)
            comment = request.data.get('comment', False)
            # image = request.data[0]['image']
            image = request.FILES.getlist('image')  # get file image

            test = Test.objects.filter(id=id_test).first()

            new_comment = TestComment.objects.create(content=comment, id_user=request.user, id_test=test)
            if not new_comment:
                return Response({'status': 'cannot create new comment'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            for img in image:
                try:
                    result = cloudinary.uploader.upload(img, folder="Online_Test_Project/Comment",
                                                        public_id=img.name)
                    ImageComment.objects.create(name=img.name, image=result['secure_url'], id_comment=new_comment)
                except cloudinary.exceptions.Error as e:
                    print("Error uploading image:", e)
                    continue
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        # print(request.data)
        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def ReplyComment(request, id_test):
    if request.data:
        print(request.data)
        context = {}
        # comment = request.data[0]['comment']
        # id_parent = request.data[0]['id_parent']
        comment = request.data.get('comment', False)
        id_parent = request.data.get('id_parent', False)
        image = request.FILES.getlist('image')

        comment_reply = TestComment.objects.filter(id=id_parent).first()
        test = Test.objects.filter(id=id_test).first()

        if not comment_reply or not test:
            return Response({'status': 'comment or test not found'}, status=status.HTTP_404_NOT_FOUND)

        new_reply = TestComment.objects.create(content=comment, id_user=request.user, id_test=test,
                                               id_parent=comment_reply)

        if not new_reply:
            return Response({'status': 'new reply creating failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        context['image'] = []
        for img in image:
            try:
                result = cloudinary.uploader.upload(img, folder="Online_Test_Project/Comment",
                                                    transformation=[{"height": 400, "crop": "scale"}])
                new_image = ImageComment.objects.create(name=img.name, image=result['secure_url'],
                                                        id_comment=new_reply)
                image_serializer = ImageSerializer(new_image).data
                context['image'].append(image_serializer)
            except cloudinary.exceptions.Error as e:
                print("Error uploading image:", e)
                continue
        reply_serializer = CommentSerializer(new_reply).data
        context['data'] = reply_serializer
        context['length'] = TestComment.objects.filter(id_parent=comment_reply.id, id_test=test).count()
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    # print(request.data)
    return Response(context, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def EditComment(request, id_test):
    if request.data:
        # print(request.data)
        # id_comment = request.data[0]['id_comment']
        # id_reply = request.data[0]['id_reply']
        # content = request.data[0]['content']
        # action = request.data[0]['action']

        id_comment = request.data.get('id_comment', False)
        id_reply = request.data.get('id_reply', False)
        content = request.data.get('content', False)
        action = request.data.get('action', False)
        image_id_string = request.data.get('exist_image', False)
        new_image = request.FILES.getlist('new_image')

        # Convert each string in the list to an integer using map() and int()
        if image_id_string:
            image_id_list = image_id_string.split(",")
            exist_image = list(map(int, image_id_list))
        else:
            exist_image = ''

        # print(exist_image)
        # print(new_image)

        test = Test.objects.filter(id=id_test).first()
        comment = TestComment.objects.filter(id=id_comment, id_user=request.user, id_test=test)

        if not test or not comment:
            return Response({"status": "test or comment not found"}, status=status.HTTP_404_NOT_FOUND)

        object = None

        if action == 'reply':
            reply = TestComment.objects.filter(id=id_reply, id_parent__in=comment, id_user=request.user,
                                               id_test=test)

            if not reply:
                return Response({"status": "reply not found"}, status=status.HTTP_404_NOT_FOUND)
            reply.update(content=content)
            object = reply.first()
            # reply_serializer = CommentSerializer(reply, many=True).data
            # return Response(reply_serializer, status=status.HTTP_200_OK)
        elif action == 'comment':
            comment.update(content=content)
            object = comment.first()
            # comment_serializer = CommentSerializer(comment, many=True).data
            # return Response(comment_serializer, status=status.HTTP_200_OK)

        image_comment = ImageComment.objects.filter(id_comment=object)  # Get all the image of a comment
        referenced_images = ImageComment.objects.filter(pk__in=exist_image)  # get the image that has not been deleted

        if image_comment.exists():
            image_to_delete = image_comment.exclude(pk__in=referenced_images.values_list('pk', flat=True))
            # print(image_to_delete)
            deleted_count = image_to_delete.delete()

        if new_image:
            for img in new_image:
                try:
                    result = cloudinary.uploader.upload(img, folder="Online_Test_Project/Comment",
                                                        transformation=[{"height": "0.5", "crop": "scale"}])

                    new_image = ImageComment.objects.create(name=img.name, image=result['secure_url'],
                                                            id_comment=object)
                except cloudinary.exceptions.Error as e:
                    print("Error uploading image:", e)
                    continue
        return Response({"status": "oke"}, status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def DeleteComment(request, id_test):
    if request.data:
        id_comment = request.data[0]['id_comment']
        id_reply = request.data[0]['id_reply']

        try:
            test = Test.objects.filter(id=id_test).first()
            comment = TestComment.objects.filter(id=id_comment, id_test=test)
        except ObjectDoesNotExist as e:
            raise e

        if id_reply > 0:
            try:
                reply = TestComment.objects.filter(id=id_reply, id_parent__in=comment, id_user=request.user,
                                                   id_test=test)
                print(reply)
                reply.delete()
                return Response({'status': 'delete reply'}, status=status.HTTP_202_ACCEPTED)
            except ObjectDoesNotExist as e:
                raise e
        else:
            try:
                comment.delete()
                return Response({'status': 'delete comment'}, status=status.HTTP_202_ACCEPTED)
            except ObjectDoesNotExist as e:
                raise e
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def LikeCmt(request, id_test):
    if request.data:
        id_comment = request.data[0]['id_comment']
        id_reply = request.data[0]['id_reply']
        action = request.data[0]['action']

        try:
            test = Test.objects.filter(id=id_test).first()
            comment = TestComment.objects.filter(id=id_comment, id_test=test).first()
        except ObjectDoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if id_reply is not None:
            try:
                reply = TestComment.objects.filter(id=id_reply, id_parent=comment, id_test=test).first()
            except ObjectDoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            if action == 'Like':
                try:
                    LikeComment.objects.create(id_comment=reply, id_user=request.user)
                    num_like = LikeComment.objects.filter(id_comment=reply).count()
                    return Response({'status': 'like', 'num_like': num_like}, status=status.HTTP_202_ACCEPTED)
                except ObjectDoesNotExist:
                    return Response(status=status.HTTP_404_NOT_FOUND)
            elif action == 'Unlike':
                try:
                    like = LikeComment.objects.filter(id_comment=reply, id_user=request.user)
                    like.delete()
                    num_like = LikeComment.objects.filter(id_comment=reply).count()
                    return Response({'status': 'unlike', 'num_like': num_like}, status=status.HTTP_202_ACCEPTED)
                except ObjectDoesNotExist:
                    return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            if action == 'Like':
                try:
                    LikeComment.objects.create(id_comment=comment, id_user=request.user)
                    num_like = LikeComment.objects.filter(id_comment=comment).count()
                    return Response({'status': 'like', 'num_like': num_like}, status=status.HTTP_202_ACCEPTED)
                except ObjectDoesNotExist:
                    return Response(status=status.HTTP_404_NOT_FOUND)
            elif action == 'Unlike':
                try:
                    like = LikeComment.objects.filter(id_comment=comment, id_user=request.user)
                    like.delete()
                    num_like = LikeComment.objects.filter(id_comment=comment).count()
                    return Response({'status': 'unlike', 'num_like': num_like}, status=status.HTTP_202_ACCEPTED)
                except ObjectDoesNotExist:
                    return Response(status=status.HTTP_404_NOT_FOUND)
        # return Response(request.data, status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)
