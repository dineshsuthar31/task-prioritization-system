from django.db import models

class Task(models.Model):
    title = models.CharField(max_length=200)
    deadline = models.IntegerField(help_text="Days remaining")
    estimated_time = models.FloatField(help_text="Hours required")
    importance = models.IntegerField(help_text="1-10 scale")
    priority_score = models.FloatField(default=0.0)
    category = models.CharField(max_length=50, default='Pending')
    reason = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
