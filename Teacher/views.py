import json
import math
from datetime import datetime, timedelta

import markdown
import markdownify
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.db.models import Q
from django.shortcuts import render
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from Question.models import Question, QuestionHint, Choice, QuestionTest, QuestionSolution
from Question.serializer import QuestionSerializer, ChoiceSerializer, HintSerializer, SolutionSerializer
from Test.models import Test, DoTest, Subject
from Test.serializer import ResultSerializer, TestSerializer, SubjectSerializer
from User.models import Profile
from User.serializer import ProfileSerializer

from bs4 import BeautifulSoup


# Create your views here.
class DashboardIndexView(APIView):
    def get(self, request):
        context = {}
        id_user = request.user.id
        get_user = Profile.objects.filter(id_user=id_user).first()
        user_serializer = ProfileSerializer(get_user).data
        all_test = Test.objects.all()
        context['all_test'] = all_test
        if user_serializer.get('is_teacher'):
            return render(request, 'teacher/index.html', context)
        else:
            return Response({"message": "User is not a teacher"}, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
def DashboardView(request, id_test):
    context = {}
    results = DoTest.objects.filter(id_test=id_test).order_by("-time_start")
    sum = 0

    for res in results:
        sum += res.score

    average_score = round(sum / results.count(), 2)

    dash_result = ResultSerializer(results, many=True).data

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
def ListTestView(request):
    context = {}
    tests = Test.objects.all()
    # all_test = TestSerializer(tests, many=True).data

    subjects = Subject.objects.all()
    all_subject = SubjectSerializer(subjects, many=True).data
    context['all_subject'] = all_subject

    paginator = Paginator(tests, 5)

    try:
        ques = paginator.page(1)
    except EmptyPage:
        ques = paginator.page(paginator.num_pages)
    page_list = ques.paginator.page_range
    context['page_list'] = list(page_list)

    # for test in all_test:
    #     time_create = test.get('created_at')
    #     # Original datetime string
    #     original_datetime_str = time_create
    #
    #     # Parse the string into a datetime object
    #     original_datetime = datetime.strptime(original_datetime_str, "%Y-%m-%dT%H:%M:%S.%f%z")
    #
    #     # Format the datetime object as required
    #     formatted_datetime_str = original_datetime.strftime("%d/%m/%Y - %H:%M")
    #     test['created_at'] = formatted_datetime_str
    #
    #     if test.get('is_practice'):
    #         test['mode'] = 'Practice'
    #     else:
    #         test['mode'] = 'Test'
    #
    #     if test.get('is_active'):
    #         test['is_active'] = 'On'
    #     else:
    #         test['is_active'] = 'Off'
    #
    #     for subject in all_subject:
    #         if test.get('id_subject') == subject.get('id'):
    #             test['subject'] = subject.get('type')
    #
    # all_test.reverse()
    # context['all_test'] = all_test
    return render(request, 'teacher/list-test.html', context)


@api_view(['POST'])
def AjaxTest(request, page):
    context = {}
    # print(f"ajax {request.data}")
    search_criteria = Q()
    subject = request.data[0]['subject']
    search = request.data[0]['search']
    active = None
    mode = None
    if request.data[0]['mode'] is not None:
        mode = request.data[0]['mode']

    if request.data[0]['active'] is not None:
        active = request.data[0]['active']
    num_data = request.data[0]['numData']
    search_criteria = Q()
    if subject:
        for s in subject:
            search_criteria |= Q(id_subject__type__icontains=s)
        # print(f'{search_criteria}')
    elif active is not None:
        search_criteria &= Q(is_active__icontains=active)
    elif search:
        search_criteria &= Q(name__icontains=search)
    elif mode:
        search_criteria &= Q(is_practice__icontains=mode)

    # print(f'{search_criteria}')
    # starting_number = (page - 1) * 5
    # ending_number = page * 5

    # print(request.GET)
    # search_value = request.GET.get('search[value]', None)
    test = Test.objects.all()

    search_test = test.filter(search_criteria)
    paginator = Paginator(search_test, num_data)

    try:
        t = paginator.page(page)
    except PageNotAnInteger:
        t = paginator.page(1)
    except EmptyPage:
        t = paginator.page(paginator.num_pages)
    page_list = t.paginator.page_range

    data = []
    for test in t:
        # Your serialization logic here
        data.append({
            'id': test.id,
            'name': test.name,
            'description': test.description,
            'duration': test.duration,
            'subject': test.id_subject.type,
            'mode': 'Practice' if test.is_practice else 'Test',
            'created_at': timezone.localtime(test.created_at).strftime("%Y-%m-%d %H:%M"),
            'is_active': 'On' if test.is_active else 'Off'
        })

    response = {
        # 'draw': int(page_number),
        # 'recordsTotal': paginator.count,
        # 'recordsFiltered': paginator.count,
        'data': data,
        'page_list': list(page_list),
    }

    if search_test:
        return Response(response, status=status.HTTP_201_CREATED)
    else:
        return Response({'status': 'No results found'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def SearchTest(request):
    # print(f"filter {request.data}")
    subject = request.data[0]['subject']
    search = request.data[0]['search']
    active = request.data[0]['active']
    num_data = request.data[0]['numData']
    mode = request.data[0]['mode']
    tests = Test.objects.all()

    search_criteria = Q()
    if subject:
        for s in subject:
            search_criteria |= Q(id_subject__type__icontains=s)
        # print(f'{search_criteria}')
    if active is not None:
        search_criteria &= Q(is_active__icontains=active)
    if search:
        search_criteria &= Q(name__icontains=search)
    if mode is not None:
        search_criteria &= Q(is_practice__icontains=mode)

    # print(search_criteria)

    search_test = tests.filter(search_criteria)
    paginator = Paginator(search_test, num_data)

    try:
        t = paginator.page(1)
    except EmptyPage:
        t = paginator.page(paginator.num_pages)
    page_list = t.paginator.page_range
    # print(ques)
    data = []
    for test in t:
        # Your serialization logic here
        data.append({
            'id': test.id,
            'name': test.name,
            'description': test.description,
            'duration': test.duration,
            'subject': test.id_subject.type,
            'mode': 'Practice' if test.is_practice else 'Test',
            'created_at': timezone.localtime(test.created_at).strftime("%Y-%m-%d %H:%M"),
            'is_active': 'On' if test.is_active else 'Off'
        })

    response = {
        # 'draw': int(page_number),
        # 'recordsTotal': paginator.count,
        # 'recordsFiltered': paginator.count,
        'data': data,
        'page_list': list(page_list),
    }

    if search_test:
        return Response(response, status=status.HTTP_201_CREATED)
    else:
        return Response({'status': 'No results found'}, status=status.HTTP_204_NO_CONTENT)


class CreateQuickTestView(APIView):
    def get(self, request):
        context = {}
        subjects = Subject.objects.all()
        all_subject = SubjectSerializer(subjects, many=True).data
        context['all_subject'] = all_subject
        return render(request, 'teacher/create-quick-test.html', context)

    def post(self, request):
        # context = {}
        # context['data'] = request.data
        if request.data is not None:
            name = request.data[0]['name']
            description = request.data[0]['description']
            id_subject = request.data[0]['subject']
            numbers_of_questions = request.data[0]['numbers_of_questions']
            duration = request.data[0]['duration']
            is_practice = request.data[0]['is_practice']
            is_active = request.data[0]['is_active']

            duration_timedelta = timedelta(seconds=duration)

            subject = Subject.objects.filter(id=id_subject).first()
            test = Test.objects.create(name=name, description=description, id_subject=subject, is_practice=is_practice,
                                       numbers_of_questions=numbers_of_questions, duration=duration_timedelta,
                                       id_user_create=request.user, is_active=is_active)

            data = request.data[1]['question']
            # print(data)
            # print(subject)
            for ques in data:
                # print(ques['question'])
                name = ques['question']
                ques_hint = ques['hint']
                question = Question.objects.create(name=name, id_subject=subject)
                hint = QuestionHint.objects.create(content=ques_hint, id_question=question)
                QuestionTest.objects.create(id_question=question, id_test=test)
                i = 1
                for ans in ques['answers']:
                    # print(i)
                    choice = Choice.objects.create(content=ans, id_question=question)
                    if i == int(ques['correctAnswerIndex']):
                        # print("oidoioi")
                        choice.set_is_true(True)
                        choice.save()
                        i = 5
                    else:
                        i += 1

            return Response({'status': 'success', 'data': request.data}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'error'}, status=status.HTTP_400_BAD_REQUEST)


class CreateTestView(APIView):
    # return create test template
    def get(self, request):
        context = {}
        subjects = Subject.objects.all()
        all_subject = SubjectSerializer(subjects, many=True).data
        context['all_subject'] = all_subject
        return render(request, 'teacher/create-test.html', context)

    def post(self, request):
        if request.data is not None:
            name = request.data[0]['name']
            description = request.data[0]['description']
            id_subject = request.data[0]['subject']
            numbers_of_questions = request.data[0]['numbers_of_questions']
            if numbers_of_questions == '':
                numbers_of_questions = 0
            duration = request.data[0]['duration']
            is_practice = request.data[0]['is_practice']
            is_active = request.data[0]['is_active']

            duration_timedelta = timedelta(seconds=duration)

            subject = Subject.objects.filter(id=id_subject).first()
            test = Test.objects.create(name=name, description=description, id_subject=subject, is_practice=is_practice,
                                       numbers_of_questions=numbers_of_questions, duration=duration_timedelta,
                                       id_user_create=request.user, is_active=is_active)
            if test is not None:
                return Response({'status': 'success', 'data': request.data}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'error'}, status=status.HTTP_400_BAD_REQUEST)


class EditTestView(APIView):
    # return create test template
    def get(self, request, id_test):
        context = {}
        subjects = Subject.objects.all()
        all_subject = SubjectSerializer(subjects, many=True).data
        context['all_subject'] = all_subject

        test_info = Test.objects.filter(id=id_test).first()
        test = TestSerializer(test_info).data
        context['test'] = test

        question_test = QuestionTest.objects.filter(id_test=test_info).values('id_question')
        context['all_question'] = []
        if question_test is not None:
            for x in question_test:
                question = Question.objects.filter(id=x['id_question']).first()
                all_question = QuestionSerializer(question).data
                # print(all_question)
                context['all_question'].append(all_question)
        return render(request, 'teacher/edit-test.html', context)

    def post(self, request, id_test):
        if request.data is not None:
            name = request.data[0]['name']
            description = request.data[0]['description']
            id_subject = request.data[0]['subject']
            numbers_of_questions = request.data[0]['numbers_of_questions']
            duration = request.data[0]['duration']
            is_practice = request.data[0]['is_practice']
            is_active = request.data[0]['is_active']

            duration_timedelta = timedelta(seconds=duration)

            subject = Subject.objects.filter(id=id_subject).first()
            test = Test.objects.filter(id=id_test).update(name=name, description=description, id_subject=subject,
                                                          is_practice=is_practice, is_active=is_active,
                                                          numbers_of_questions=numbers_of_questions,
                                                          duration=duration_timedelta, id_user_create=request.user)
            if test is not None:
                return Response({'status': 'success', 'data': request.data}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def DeleteTestView(request, id_test):
    try:
        Test.objects.filter(id=id_test).delete()
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
    except json.JSONDecodeError as e:
        return Response({'status': 'error', 'message': f'JSON Decode Error: {str(e)}'})


# Show all the questions of a subject
@api_view(['GET'])
def TestListQuesView(request, id_test):
    context = {}
    get_test = Test.objects.filter(id=id_test).first()
    test = TestSerializer(get_test).data
    id_subject = test.get('id_subject')

    test_question = QuestionTest.objects.filter(id_test=get_test)

    if test_question:
        test_question_ids = test_question.values_list('id_question', flat=True)  # Get ids of questions in the test

        # Filter questions that are not in the test
        questions = Question.objects.filter(id_subject=id_subject).exclude(id__in=test_question_ids)
    else:
        questions = Question.objects.filter(id_subject=id_subject)

    all_question = QuestionSerializer(questions, many=True).data
    context['all_question'] = all_question
    print(context)
    return Response(context, status=status.HTTP_200_OK)


@api_view(['POST'])
def UpdateTestQuesView(request, id_test):
    if request.data is not None:
        test = Test.objects.filter(id=id_test).first()
        for question in request.data:
            # print(question['questionId'])
            id_question = question['questionId']
            question = Question.objects.filter(id=id_question).first()
            exist_question = QuestionTest.objects.filter(id_question=question, id_test=test).first()
            if exist_question is None:
                QuestionTest.objects.create(id_question=question, id_test=test)
            # else:
            #     QuestionTest.objects.update(id_question=question)
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
    else:
        return Response({'status': 'error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def DeleteTestQuesView(request, id_test):
    if request.data is not None:
        # print(request.data)
        test = Test.objects.filter(id=id_test).first()
        id_question = request.data
        question = Question.objects.filter(id=id_question).first()
        exist_question = QuestionTest.objects.filter(id_question=question, id_test=test).first()
        # print(exist_question)
        if exist_question is not None:
            QuestionTest.objects.filter(id_question=question, id_test=test).delete()
            QuestionTest.objects.filter(id_test=test).first().save()
            return Response({'status': 'delete successfully'}, status=status.HTTP_200_OK)
        else:
            # QuestionTest.objects.filter(id_test=test).first().save()
            return Response({'status': 'There is no question in the test'}, status=status.HTTP_204_NO_CONTENT)
    return Response({'status': 'error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def ListQuestionView(request):
    context = {}
    questions = Question.objects.all()
    # paginator = Paginator(questions, 10)

    subjects = Subject.objects.all()
    all_subject = SubjectSerializer(subjects, many=True).data
    context['all_subject'] = all_subject

    paginator = Paginator(questions, 5)

    try:
        ques = paginator.page(1)
    except EmptyPage:
        ques = paginator.page(paginator.num_pages)
    page_list = ques.paginator.page_range
    context['page_list'] = list(page_list)
    # page = 1
    #
    # try:
    #     ques = paginator.page(page)
    # except PageNotAnInteger:
    #     ques = paginator.page(1)
    # except EmptyPage:
    #     ques = paginator.page(paginator.num_pages)

    return render(request, 'teacher/list-question.html', context)


@api_view(['POST'])
def AjaxQuestion(request, page):
    context = {}
    # print(f"ajax {request.data}")
    search_criteria = Q()
    subject = request.data[0]['subject']
    search = request.data[0]['search']
    active = None
    if request.data[0]['active'] is not None:
        active = request.data[0]['active']
    num_data = request.data[0]['numData']
    search_criteria = Q()
    if subject:
        for s in subject:
            search_criteria |= Q(id_subject__type__icontains=s)
        # print(f'{search_criteria}')
    elif active is not None:
        search_criteria &= Q(is_active__icontains=active)
    elif search:
        search_criteria &= Q(name__icontains=search)

    # print(f'{search_criteria}')
    # starting_number = (page - 1) * 5
    # ending_number = page * 5

    # print(request.GET)
    # search_value = request.GET.get('search[value]', None)
    #
    questions = Question.objects.all()

    search_question = questions.filter(search_criteria)
    paginator = Paginator(search_question, num_data)

    try:
        ques = paginator.page(page)
    except PageNotAnInteger:
        ques = paginator.page(1)
    except EmptyPage:
        ques = paginator.page(paginator.num_pages)
    page_list = ques.paginator.page_range
    # context['page_list'] = list(page_list)
    # all_question = QuestionSerializer(questions[starting_number:ending_number], many=True).data

    # _start = request.GET.get('start')
    # _length = request.GET.get('length')
    # paginator = Paginator(questions, 10)  # Assuming 10 records per page

    # print(request.GET)

    # if _start and _length:
    #     start = int(_start)
    #     length = int(_length)
    #     page = math.ceil(start / length) + 1
    #     per_page = length
    #
    # page_number = request.GET.get('draw', 1)
    # try:
    #     page_obj = paginator.page(page)
    # except EmptyPage:
    #     # Return an empty page if the requested page is out of range
    #     page_obj = paginator.page(1)

    data = []
    for question in ques:
        # Your serialization logic here
        data.append({
            'id': question.id,
            'name': question.name,
            'rtf': question.rtf,
            'subject': question.id_subject.type,
            'created_at': timezone.localtime(question.created_at).strftime("%Y-%m-%d %H:%M"),
            'is_active': 'On' if question.is_active else 'Off'
        })

    response = {
        # 'draw': int(page_number),
        # 'recordsTotal': paginator.count,
        # 'recordsFiltered': paginator.count,
        'data': data,
        'page_list': list(page_list),
    }

    if search_question:
        return Response(response, status=status.HTTP_201_CREATED)
    else:
        return Response({'status': 'No results found'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def SearchQuestion(request):
    # print(f"filter {request.data}")
    subject = request.data[0]['subject']
    search = request.data[0]['search']
    active = request.data[0]['active']
    num_data = request.data[0]['numData']
    questions = Question.objects.all()

    search_criteria = Q()
    if subject:
        for s in subject:
            search_criteria |= Q(id_subject__type__icontains=s)
        # print(f'{search_criteria}')
    if active is not None:
        search_criteria &= Q(is_active__icontains=active)
    if search:
        search_criteria &= Q(name__icontains=search)

    search_question = questions.filter(search_criteria)
    paginator = Paginator(search_question, num_data)

    try:
        ques = paginator.page(1)
    except EmptyPage:
        ques = paginator.page(paginator.num_pages)
    page_list = ques.paginator.page_range
    # print(ques)
    data = []
    for question in ques:
        # Your serialization logic here
        data.append({
            'id': question.id,
            'name': question.name,
            'subject': question.id_subject.type,
            'created_at': timezone.localtime(question.created_at).strftime("%Y-%m-%d %H:%M"),
            'is_active': 'On' if question.is_active else 'Off'
        })

    response = {
        'data': data,
        'page_list': list(page_list),
    }

    if search_question:
        return Response(response, status=status.HTTP_201_CREATED)
    else:
        return Response({'status': 'No results found'}, status=status.HTTP_204_NO_CONTENT)


# Create question
class CreateQuestionView(APIView):
    def get(self, request):
        context = {}
        subjects = Subject.objects.all()
        all_subject = SubjectSerializer(subjects, many=True).data
        context['all_subject'] = all_subject
        return render(request, 'teacher/create-question.html', context)

    def post(self, request):
        if request.data is not None:
            print(request.data)
            # for ques in request.data:
            #     print(ques['question'][0]['question'])
            data = request.data[0]['question']
            id_subject = request.data[0]['subject']
            subject = Subject.objects.filter(id=id_subject).first()
            # print(subject)
            for ques in data:
                # print(ques['question'])
                name = ques['question']
                plain_ques = BeautifulSoup(name).get_text()

                ques_hint = ques['hint']
                plain_hint = BeautifulSoup(ques_hint).get_text()

                ques_sol = ques['solution']
                plain_sol = BeautifulSoup(ques_sol).get_text()

                question = Question.objects.create(name=plain_ques, rtf=name, id_subject=subject)
                hint = QuestionHint.objects.create(content=plain_hint, rtf=ques_hint, id_question=question)
                solution = QuestionSolution.objects.create(content=plain_sol, rtf=ques_sol, id_question=question)
                i = 1
                for ans in ques['answers']:
                    # print(i)
                    plain_ans = BeautifulSoup(ans).get_text()
                    choice = Choice.objects.create(content=plain_ans, rtf=ans, id_question=question)
                    if i == int(ques['correctAnswerIndex']):
                        # print("oidoioi")
                        choice.set_is_true(True)
                        choice.save()
                        i = 5
                    else:
                        i += 1
            return Response({'status': 'success', 'data': request.data}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'error'}, status=status.HTTP_400_BAD_REQUEST)


class EditQuestionView(APIView):
    # return create test template
    def get(self, request, id_question):
        context = {}
        subjects = Subject.objects.all()
        all_subject = SubjectSerializer(subjects, many=True).data
        context['all_subject'] = all_subject

        question_info = Question.objects.filter(id=id_question).first()
        question = QuestionSerializer(question_info).data

        question['rtf'] = markdown.markdown(question['rtf'])
        context['question'] = question

        choices = Choice.objects.filter(id_question=question_info)
        all_choice = ChoiceSerializer(choices, many=True).data
        context['all_choice'] = all_choice

        hint_info = QuestionHint.objects.filter(id_question=question_info).first()
        hint = HintSerializer(hint_info).data
        context['hint'] = hint

        solution_info = QuestionSolution.objects.filter(id_question=question_info).first()
        solution = SolutionSerializer(solution_info).data
        context['solution'] = solution

        return render(request, 'teacher/edit-question.html', context)

    def post(self, request, id_question):
        if request.data is not None:
            # print(request.data)
            # question = Question.objects.filter(id=id_question).first()
            name = request.data[0]['name']
            plain_ques = BeautifulSoup(name).get_text()
            # markdown_ques = markdownify.markdownify(name, heading_style="ATX")

            # print(plain_ques)
            # print(markdown_ques)

            hint = request.data[0]['hint']
            plain_hint = BeautifulSoup(hint).get_text()
            # markdown_hint = markdownify.markdownify(hint, heading_style="ATX")

            solution = request.data[0]['solution']
            plain_sol = BeautifulSoup(solution).get_text()
            # markdown_sol = markdownify.markdownify(solution, heading_style="ATX")

            # print(hint)
            id_subject = request.data[0]['subject']
            is_active = request.data[0]['is_active']
            all_answer = request.data[1]['answers']
            all_answerId = request.data[1]['answersId']
            for i in range(0, len(all_answer)):
                plain_ans = BeautifulSoup(all_answer[i]).get_text()
                # markdown_ans = markdownify.markdownify(all_answer[i], heading_style="ATX")
                if all_answerId[i] == request.data[1]['answerTrue']:
                    Choice.objects.filter(id=all_answerId[i]).update(content=plain_ans, rtf=all_answer[i], is_true=True)
                else:
                    Choice.objects.filter(id=all_answerId[i]).update(content=plain_ans, rtf=all_answer[i], is_true=False)
            # print(request.data[1]['answers'][0])
            # is_active = request.data[0]['is_active']

            subject = Subject.objects.filter(id=id_subject).first()

            question = Question.objects.filter(id=id_question).first()

            Question.objects.filter(id=id_question).update(name=plain_ques, rtf=name, id_subject=subject, is_active=is_active)
            question_hint = QuestionHint.objects.filter(id_question=question).first()
            if question_hint is None:
                QuestionHint.objects.create(content=plain_hint, rtf=hint, id_question=question)
            else:
                QuestionHint.objects.filter(id_question=question).update(content=plain_hint, rtf=hint)

            question_solution = QuestionSolution.objects.filter(id_question=question).first()
            if question_solution is None:
                QuestionSolution.objects.create(content=plain_sol, rtf=solution, id_question=question)
            else:
                QuestionSolution.objects.filter(id_question=question).update(content=plain_sol, rtf=solution)
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def DeleteQuestionView(request, id_question):
    try:
        Question.objects.filter(id=id_question).delete()
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
    except json.JSONDecodeError as e:
        return Response({'status': 'error', 'message': f'JSON Decode Error: {str(e)}'})
