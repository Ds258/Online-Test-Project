from django.contrib import admin

from Question.models import Question, Choice, QuestionTest, QuestionHint


class AnswerInline(admin.TabularInline):
    model = Choice
    extra = 1


class HintInline(admin.TabularInline):
    model = QuestionHint
    extra = 1


class QuestionAdmin(admin.ModelAdmin):
    inlines = [AnswerInline, HintInline]


# Register your models here.
admin.site.register(Question, QuestionAdmin)
admin.site.register(QuestionTest)
