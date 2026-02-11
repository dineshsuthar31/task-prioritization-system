from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('priority_score', 'category', 'reason')

    def validate_importance(self, value):
        if not (1 <= value <= 10):
            raise serializers.ValidationError("Importance must be between 1 and 10.")
        return value

    def validate_estimated_time(self, value):
        if value <= 0:
            raise serializers.ValidationError("Estimated time must be positive.")
        return value
