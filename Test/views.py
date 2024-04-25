import json
import random
import datetime

from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect, cookie
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from Question.models import QuestionTest, Choice, Question, UserAnswer
from Question.serializer import QuestionSerializer, ChoiceSerializer
from Test.models import Test, Subject, DoTest, FavoriteTest
from Test.serializer import TestSerializer, SubjectSerializer, FavorSerializer
from User.models import Profile


# Create your views here.
class TestIndexView(APIView):
    def get(self, request):
        context = {}
        all_test = Test.objects.filter(is_practice=False)
        all_subject = Subject.objects.all()

        paginator = Paginator(all_test, 6)
        page_number = request.GET.get('page')
        # print(page_number)
        if page_number is None:
            page_number = 1
        page_obj = paginator.get_page(page_number)
        page_list = list(range(1, page_obj.paginator.num_pages + 1))

        # print(str(all_test))
        if all_test.exists():
            test = TestSerializer(page_obj, many=True).data
            subject = SubjectSerializer(all_subject, many=True).data
            if request.user.is_authenticated:
                all_favor = FavoriteTest.objects.filter(id_test__in=all_test, id_user=request.user, is_active=True)
                favor = FavorSerializer(all_favor, many=True).data
                for t in test:
                    for f in favor:
                        if f['id_test'] == t['id'] and f['is_active'] == True:
                            t['favor'] = True

            context = {
                'test': test,
                'subject': subject,
                'page_list': page_list,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'page_number': int(page_number)
            }

            # return Response({'status': 'ok', 'context': context, 'page_list': page_list}, status=status.HTTP_200_OK)
            return render(request, 'test/index.html', context)
        else:
            # return Response({'status': 'error'}, status=status.HTTP_401_UNAUTHORIZED)
            return render(request, 'test/index.html')

    def post(self, request):
        id = request.POST.get('id_test')
        # print(request.POST)
        take_test = Test.objects.filter(id=id).first()
        if "Submit" in request.POST:
            # Handle Submit button click
            return HttpResponseRedirect(reverse("Test:StartTestView", kwargs={"id_test": take_test.id}))
            # return Response(status=status.HTTP_200_OK)
        elif "Comment" in request.POST:
            # Handle Comment button click
            # Redirect to comment page or perform desired action
            # return Response(status=status.HTTP_202_ACCEPTED)
            return HttpResponseRedirect(reverse("Comment:CommentView", kwargs={"id_test": take_test.id}))
            # else:
            #     return Response({'status': 'unauthorized'}, status=status.HTTP_204_NO_CONTENT)
            # return Response(status=status.HTTP_201_CREATED)
        else:
            # Handle other cases if needed
            return Response({"status": "Bad request"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def SearchTest(request):
    subject = request.data[0]['subject']
    search = request.data[0]['search']
    favorite = request.data[0]['favorite']
    get_test = Test.objects.all()
    fav = FavoriteTest.objects.filter(is_active=True).values_list('id_test', flat=True)

    # print(fav)

    if favorite:
        get_test = get_test.filter(id__in=fav)

    # print(search)
    # search_fields = ['name', 'id_subject__type']
    # Define search criteria
    search_criteria = Q()
    if subject:
        for s in subject:
            search_criteria |= Q(id_subject__type__icontains=s)
        # print(f'{search_criteria}')
    search_criteria &= Q(name__icontains=search)

    # search_test = Test.objects.filter(search_criteria, is_practice=False)
    search_test = get_test.filter(search_criteria, is_practice=False)

    paginator = Paginator(search_test, 6)
    page_number = request.data[0]['page']
    # print(page_number)
    if page_number is None:
        page_number = 1
    page_obj = paginator.get_page(page_number)
    page_list = list(range(1, page_obj.paginator.num_pages + 1))

    try:
        # test = TestSerializer(search_test, many=True).data
        context = {}
        test = TestSerializer(page_obj, many=True).data
        for t in test:
            for id in fav:
                # print(f"{t['id']} == {id}")
                if int(t['id']) == int(id):
                    t['favor'] = True
                    break
                else:
                    t['favor'] = False
        if test:
            context = {
                'test': test,
                'page_list': page_list,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'page_number': int(page_number)
            }

            return Response(context, status=status.HTTP_201_CREATED)
        else:
            return Response({'status': 'No results found'}, status=status.HTTP_204_NO_CONTENT)
    # print(test)
    except Exception as e:
        raise e


class TakeTestView(APIView):
    def post(self, request, id_do_test):
        user = request.user
        choice_right = 0
        score = 0
        try:
            data = request.data  # if data from request is in JSON format, use json.loads to get data
            # print(data)  # data is a list
            if len(data) > 0:
                test_id = data[0]['test_id']
                test = Test.objects.filter(id=test_id).first()  # get number of questions of that test
                do_test = DoTest.objects.filter(id=id_do_test).first()
                for answer in data[1:]:
                    # get the first result of the QuerySet
                    choice = Choice.objects.filter(id=answer['choice_id']).first()
                    UserAnswer.objects.create(id_user=user, id_do_test=do_test, id_choice=choice)
                    # print(choice)
                    if choice.get_is_true():  # check if the choice is true
                        choice_right += 1
                score += round(choice_right / test.numbers_of_questions * 10, 2)  # Limit Floats to Two Decimal Points
                time_finish = timezone.now()
                # Save test's score
                DoTest.objects.filter(id=id_do_test).update(score=score, time_finish=time_finish)

                response = Response({'status': 'success', 'score': score}, status=status.HTTP_200_OK)
                response.delete_cookie('test_cookie')
                return response
            else:
                response = Response({'status': 'success', 'score': score}, status=status.HTTP_200_OK)
                response.delete_cookie('test_cookie')
                return response
        except json.JSONDecodeError as e:
            return Response({'status': 'error', 'message': f'JSON Decode Error: {str(e)}'})

    def get(self, request, id_test, id_do_test):
        do_test = DoTest.objects.filter(id=id_do_test).first()
        if do_test.time_finish is not None:
            return HttpResponseRedirect(reverse("Test:TestIndexView"))
        context = {}
        user = request.user

        test = Test.objects.filter(id=id_test).first()
        this_test = TestSerializer(test).data
        context['this_test'] = this_test

        # print(context['this_test']['duration'])
        if do_test.duration_left is not None:
            print(do_test.duration_left)
            context['this_test']['duration'] = do_test.duration_left
        all_question_test = QuestionTest.objects.filter(id_test=test)
        # data['all_question_test'] = all_question_test

        # Get question's id from the question test
        question_ids = [qt.id_question_id for qt in all_question_test]

        # Get question from question's id
        questions = Question.objects.filter(id__in=question_ids)
        all_question = QuestionSerializer(questions, many=True).data

        # Shuffle questions
        random.shuffle(all_question)
        context['all_question'] = all_question
        context['id_do_test'] = id_do_test

        choices = {ques.id: Choice.objects.filter(id_question=ques) for ques in questions}  # In QuerySet format
        all_choice = {question_id: ChoiceSerializer(choices_queryset, many=True).data for question_id, choices_queryset
                      in choices.items()}
        context['all_choice'] = all_choice

        # return Response({'status': 'ok', 'context': context}, status=status.HTTP_200_OK)
        return render(request, 'test/test.html', context)


# Start Test: Create Session Test before doing a Test
def StartTestView(request, id_test):
    test = Test.objects.filter(id=id_test).first()
    exp_time = timezone.now() + test.getDuration() + datetime.timedelta(minutes=15)
    do_test = DoTest.objects.create(id_test=test, id_user=request.user, time_expire=exp_time, score=0)
    do_test.save()

    response = HttpResponseRedirect(reverse("Test:TakeTestView", kwargs={"id_test": id_test, "id_do_test": do_test.id}))
    response.set_cookie(key='test_cookie', value=do_test.getUUID(),
                        expires=exp_time.astimezone(timezone.get_current_timezone()), secure=True)
    return response


@api_view(['POST'])
def SaveTestView(request, id_do_test):
    # Assuming request.data contains the time left in seconds
    time_left_seconds = request.data

    # Convert seconds to a timedelta object
    duration_left = datetime.timedelta(seconds=time_left_seconds)

    do_test = DoTest.objects.filter(id=id_do_test).update(duration_left=duration_left)
    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
def MarkFavorite(request, id_test):
    is_favorited = request.data[0]['is_favorited']
    try:
        test = Test.objects.filter(id=id_test).first()
    except ObjectDoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        if is_favorited:
            # print(is_favorited)
            FavoriteTest.objects.create(id_test=test, id_user=request.user)
        else:
            favor = FavoriteTest.objects.filter(id_test=test, is_active=True).first()
            favor.delete()

    except Exception as e:
        raise e
    return Response(status=status.HTTP_201_CREATED)
