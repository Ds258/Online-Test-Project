import json
import random
import uuid

from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from rest_framework import status, response
from rest_framework.response import Response
from rest_framework.views import APIView

from Question.models import Choice, QuestionTest, Question, QuestionHint, UserAnswer
from Question.serializer import QuestionSerializer, ChoiceSerializer, HintSerializer
from Test.models import Test, Subject, DoTest
from Test.serializer import TestSerializer, SubjectSerializer
from User.models import Profile


# Create your views here.
class PracticeIndexView(APIView):
    def get(self, request):
        context = {}
        all_test = Test.objects.filter(is_practice=True)
        all_subject = Subject.objects.all()
        print(str(all_test))
        if all_test.exists():
            test = TestSerializer(all_test, many=True).data
            subject = SubjectSerializer(all_subject, many=True).data
            context['test'] = test
            context['subject'] = subject
            # return Response({'status': 'ok', 'data': data}, status=status.HTTP_200_OK)
            return render(request, 'practice/index.html', {'context': context})
        else:
            return Response({'status': 'error'}, status=status.HTTP_401_UNAUTHORIZED)

    def post(self, request):
        name = request.data.get('test_name')
        take_test = Test.objects.filter(name=name).first()
        return HttpResponseRedirect(reverse("Practice:StartPracticeView", kwargs={"id_test": take_test.id}))


class TakePracticeView(APIView):
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

                # Save test's score

                DoTest.objects.filter(id=id_do_test).update(score=score)

                del request.session['expiration_time']

                response = Response({'status': 'success', 'score': score}, status=status.HTTP_200_OK)
                response.delete_cookie('practice_cookie')
                return response
            else:
                response = Response({'status': 'success', 'score': score}, status=status.HTTP_200_OK)
                response.delete_cookie('practice_cookie')
                return response
        except json.JSONDecodeError as e:
            return Response({'status': 'error', 'message': f'JSON Decode Error: {str(e)}'})

    def get(self, request, id_test, id_do_test):
        context = {}
        user = request.user

        test = Test.objects.filter(id=id_test).first()
        this_test = TestSerializer(test).data
        context['this_test'] = this_test

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

        hints = {ques.id: QuestionHint.objects.filter(id_question=ques) for ques in questions}
        all_hint = {question_id: HintSerializer(hints_queryset, many=True).data for question_id, hints_queryset in
                    hints.items()}
        context['all_hint'] = all_hint

        # return Response({'status': 'ok', 'context': context}, status=status.HTTP_200_OK)
        return render(request, 'practice/practice.html', context)


def StartPracticeView(request, id_test):
    # Create a record which will save the score of that test
    cookie_value = request.COOKIES.get('test_cookie')
    print(cookie_value)
    test = Test.objects.filter(id=id_test).first()
    exp_time = timezone.localtime(timezone.now() + test.getDuration())
    if cookie_value:
        # Extract the expiration time from the cookie value
        expiration_time = request.session.get('expiration_time')
        print(expiration_time)
        print(timezone.localtime(timezone.now()))
        if timezone.now().timestamp() > expiration_time:
            request.session['expiration_time'] = exp_time.timestamp()
            return Start(id_test, request.user, test)  # Cookie has expired
        else:
            do_test = DoTest.objects.filter(uuid=cookie_value).first()
            response.set_cookie(key='practice_cookie', value=do_test.getUUID(), max_age=test.getDuration(), secure=True)
            return response
    else:
        request.session['expiration_time'] = exp_time.timestamp()
        return Start(id_test, request.user, test)


def Start(id_test, user, test):
    # Create a record which will save the score of that test
    test = Test.objects.filter(id=id_test).first()
    do_test = DoTest.objects.create(id_test=test, id_user=user, score=0)
    do_test.save()

    response = HttpResponseRedirect(reverse("Practice:TakePracticeView", kwargs={"id_test": id_test, "id_do_test": do_test.id}))
    response.set_cookie(key='practice_cookie', value=do_test.getUUID(), max_age=test.getDuration(), secure=True)
    return response
