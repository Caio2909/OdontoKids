from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import json

class User(AbstractUser):
    ROLE_CHOICES = (
        ('crianca', 'Criança'),
        ('dentista', 'Odontopediatra'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='crianca')

class Avatar(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='avatar')
    # Armazenaremos a configuração do avatar como um texto JSON
    # Ex: {"skin": "skin1", "hair": "hair2", ...}
    config_json = models.TextField()

    def __str__(self):
        return f"Avatar de {self.user.username}"

    def get_config(self):
        return json.loads(self.config_json)

class Assessment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessments')
    score = models.IntegerField()
    total_questions = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Avaliação de {self.user.username} em {self.created_at.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-created_at']
