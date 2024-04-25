from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from Test.models import Test, Subject, DoTest
from Test.serializer import TestSerializer, SubjectSerializer
from User.models import Profile, User
from User.serializer import ProfileSerializer


# Create your views here.
class Index(APIView):
    def get(self, request):
        context = {}
        if request.user.is_authenticated:
            id_user = request.user.id
            get_user = Profile.objects.filter(id_user=id_user).first()
            user_serializer = ProfileSerializer(get_user).data
            # context['user'] = user_serializer
            request.session['is_teacher'] = user_serializer.get('is_teacher')
            # if user_serializer.get('is_teacher'):
            #     return HttpResponseRedirect(reverse("Teacher:DashboardIndexView"))
            return render(request, 'core/index.html')
            # return Response(context, status=status.HTTP_200_OK)

        # subjects = Subject.objects.all()
        # all_subject = SubjectSerializer(subjects, many=True).data
        # context['all_subject'] = all_subject
        # return Response({'status': 'ok', 'context': context}, status=status.HTTP_200_OK)  # must have status code
        return render(request, 'core/index.html', context)


class Login(APIView):
    def get(self, request):
        return render(request, 'core/login.html')

    def post(self, request):
        username = request.data.get('inputUsername', False)
        password = request.data.get('inputPassword', False)
        # Using custom authentication for signing in
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # next_page = request.GET.get('next')
            # if next_page:
            #     return redirect(next_page)
            # else:
            #     return Response(status=status.HTTP_200_OK) # must have status code
            return Response(status=status.HTTP_200_OK)  # must have status code
        else:
            return Response({'status': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
            # messages.error(request, 'Invalid username or password.')  # Display error message


class Signup(APIView):
    def get(self, request):
        return render(request, 'core/signup.html')

    def post(self, request):
        new_firstname = request.data.get('inputFirstName')
        new_lastname = request.data.get('inputLastName')
        new_username = request.data.get('inputUsername')
        new_password = request.data.get('inputPassword')
        new_email = request.data.get('inputEmail')

        if check_exist(new_username):
            return Response({'status': 'exist'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            user = User.objects.create(first_name=new_firstname, last_name=new_lastname, username=new_username,
                                       password=new_password, email=new_email)
            user.password = make_password(new_password)
            user.save()
            Profile.objects.create(id_user=user)
            # return Response({'status': 'success'}, status=status.HTTP_200_OK)
            return HttpResponseRedirect(reverse("Core:Login"))


def check_exist(username):
    try:
        user = Profile.objects.get(username=username)
        return True
    except:
        return False


class Logout(APIView):
    def get(self, request):
        logout(request)
        return redirect('/')


@api_view(['POST'])
def CheckTestView(request):
    test_cookie = request.data
    # print(test_cookie)
    do_test = DoTest.objects.filter(uuid=test_cookie).first()
    if timezone.now().timestamp() > do_test.time_expire.timestamp():
        return Response({'status': 'expire'}, status=status.HTTP_200_OK)
    else:
        return Response({'status': 'continue', 'id_do_test': do_test.id, 'id_test': do_test.id_test.id}, status=status.HTTP_200_OK)


@api_view(['POST'])
def CancelTestView(request, id_do_test):
    response = Response({'status': 'success'}, status=status.HTTP_200_OK)
    response.delete_cookie('test_cookie')
    return response
