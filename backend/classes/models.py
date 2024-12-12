from django.db import models
import uuid
from accounts.models import CustomUser

class Class(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    subject = models.TextField(blank=True)
    code = models.CharField(max_length=6, unique=True)
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='teaching_classes')
    students = models.ManyToManyField(CustomUser, related_name='enrolled_classes', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name