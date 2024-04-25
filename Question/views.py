from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader, context


# Create your views here.
def QuestionIndexView(request, *args, **kwargs):
    context = {}
    template = loader.get_template(str('question/profile.html'))
    return HttpResponse(template.render(context, request))
