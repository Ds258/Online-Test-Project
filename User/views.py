from datetime import datetime

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.template import loader, context
from django.urls import reverse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from Question.models import QuestionTest, Question, Choice, UserAnswer, QuestionSolution
from Question.serializer import QuestionSerializer, ChoiceSerializer, UserAnswerSerializer, SolutionSerializer
from Test.models import Test, Subject, DoTest
from Test.serializer import ResultSerializer, TestSerializer
from User.models import Profile, User
from User.serializer import ProfileSerializer


# Create your views here.
# def UserIndexView(request, *args, **kwargs):
#     template = loader.get_template(str('user/profile.html'))
#     return HttpResponse(template.render(context, request))

class ProfileIndexView(APIView):
    pagination_class = PageNumberPagination

    def get(self, request):
        user = ProfileSerializer(request.user).data
        # context['user'] = user
        user_id = user.get('id')

        results = DoTest.objects.filter(id_user=user_id).order_by("-time_start")
        # print(type(results)) # QuerySet

        all_test = Test.objects.all()

        # Tests which user has joined
        tests = {res.id_test_id: Test.objects.filter(id=res.id_test_id) for res in results}
        convert_tests = {key: value[0].name for key, value in tests.items()}
        # print(convert_tests)
        # print(type(convert_tests))  # dict

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(results, request)

        if page is not None:
            serializer = ResultSerializer(page, many=True).data
        else:
            serializer = ResultSerializer(results, many=True).data

        # Convert datetime to format dd/mm/YYYY - HH:MM
        for res in serializer:
            time_start = res.get('time_start')
            # Original datetime string
            original_datetime_str = time_start

            # Parse the string into a datetime object
            original_datetime = datetime.strptime(original_datetime_str, "%Y-%m-%dT%H:%M:%S.%f%z")

            # Format the datetime object as required
            formatted_datetime_str = original_datetime.strftime("%d/%m/%Y - %H:%M")
            res['time_start'] = formatted_datetime_str
            # print(formatted_datetime_str)
            for key, value in convert_tests.items():
                if res['id_test'] == key:
                    # print(value)
                    res['name'] = value

        if page is not None:
            # Manually create paginated response
            context = {
                'all_result': serializer,
                'count': paginator.page.paginator.count,
                'num_pages': range(1, paginator.page.paginator.num_pages + 1),
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'page_number': paginator.page.number,
                'all_test': all_test,
            }
            # return Response(context, status=status.HTTP_200_OK)
            return render(request, 'user/profile.html', context)

        # return Response({'status': 'ok', 'context': serializer}, status=status.HTTP_200_OK)
        return render(request, 'user/profile.html', {'context': serializer})


@api_view(['GET'])
def DashboardView(request, id_test):
    context = {}
    user = ProfileSerializer(request.user).data
    # context['user'] = user
    user_id = user.get('id')

    results = DoTest.objects.filter(id_user=user_id, id_test=id_test).order_by("-time_start")

    sum = 0

    for res in results:
        sum += res.score

    average_score = round(sum / results.count(), 2)

    dash_result = ResultSerializer(results[:7], many=True).data

    for res in dash_result:
        time_start = res.get('time_start')
        # Original datetime string
        original_datetime_str = time_start

        # Parse the string into a datetime object
        original_datetime = datetime.strptime(original_datetime_str, "%Y-%m-%dT%H:%M:%S.%f%z")

        # Format the datetime object as required
        formatted_datetime_str = original_datetime.strftime("%d/%m/%Y - %H:%M")
        res['time_start'] = formatted_datetime_str

    context['dash_result'] = dash_result
    context['average_score'] = average_score
    context['time_test'] = results.count()

    return Response(context, status=status.HTTP_200_OK)


@api_view(['GET'])
def TestDetailView(request, id_do_test):
    context = {}
    user = request.user

    do_test = DoTest.objects.filter(id=id_do_test).first()
    test = getattr(do_test, 'id_test')

    # test = Test.objects.filter(id=id_test).first()
    this_test = TestSerializer(test).data
    context['this_test'] = this_test

    all_question_test = QuestionTest.objects.filter(id_test=test)
    # data['all_question_test'] = all_question_test

    # Get question's id from the question test
    question_ids = [qt.id_question_id for qt in all_question_test]

    # Get question from question's id
    questions = Question.objects.filter(id__in=question_ids)
    all_question = QuestionSerializer(questions, many=True).data

    context['all_question'] = all_question
    context['id_do_test'] = id_do_test

    choices = {ques.id: Choice.objects.filter(id_question=ques) for ques in questions}  # In QuerySet format
    all_choice = {question_id: ChoiceSerializer(choices_queryset, many=True).data for question_id, choices_queryset
                  in choices.items()}
    context['all_choice'] = all_choice

    user_answer = UserAnswer.objects.filter(id_do_test=do_test)
    all_user_answer = UserAnswerSerializer(user_answer, many=True).data

    solutions = {ques.id: QuestionSolution.objects.filter(id_question=ques) for ques in questions}  # In QuerySet format
    # print(solutions)
    all_solution = {question_id: SolutionSerializer(solutions_queryset, many=True).data for question_id, solutions_queryset
                    in solutions.items()}
    # print(all_solution)
    context['all_solution'] = all_solution

    for key, value in all_choice.items():
        for choice in value:
            for user_answer in all_user_answer:
                if choice.get('id') == user_answer.get('id_choice'):
                    choice['checked'] = True
                    pass

    return render(request, 'user/test-detail.html', context)
    # return Response(context, status=status.HTTP_200_OK)


class EditProfileView(APIView):
    def get(self, request):
        context = {}
        context['profile'] = Profile.objects.get(id_user=request.user.id)
        return render(request, 'user/edit.html', context)

    def post(self, request):
        new_firstname = request.data.get('inputFirstName')
        new_lastname = request.data.get('inputLastName')
        new_username = request.data.get('inputUsername')
        new_password = request.data.get('inputPasswordNew')
        current_password = request.data.get('inputPasswordCurrent')
        new_email = request.data.get('inputEmail')
        new_phone = request.data.get('inputPhone')
        new_dob = request.data.get('inputDOB')
        new_gender = request.data.get('inputGender')
        new_school = request.data.get('inputSchool')
        new_address = request.data.get('inputAddress')

        # Update profile fields conditionally based on non-null values
        update_account = {}
        update_profile = {}
        if new_firstname is not None:
            update_account['first_name'] = new_firstname
        if new_lastname is not None:
            update_account['last_name'] = new_lastname
        if new_username is not None:
            update_account['username'] = new_username
        if new_password is not None:
            password = Profile.objects.filter(id=request.user.id).value('password')
            if current_password == password:
                update_account['password'] = new_password
            # Handle password update (if needed)
            pass
        if new_email is not None:
            update_account['email'] = new_email
        if new_phone is not None:
            update_profile['phone_number'] = new_phone
        if new_gender is not None:
            update_profile['gender'] = new_gender
        if new_school is not None:
            update_profile['school'] = new_school
        if new_dob is not None:
            update_profile['dob'] = new_dob
        if new_address is not None:
            update_profile['address'] = new_address

        # Update the profile
        Profile.objects.filter(id_user=request.user.id).update(**update_profile)

        # Update the account
        User.objects.filter(id=request.user.id).update(**update_account)

        return HttpResponseRedirect("edit")
