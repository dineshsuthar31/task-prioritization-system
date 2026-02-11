from rest_framework import serializers
from .models import Task
from .logic import calculate_priority

class TaskSerializer(serializers.ModelSerializer):
    priority_details = serializers.SerializerMethodField()
    is_feasible = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('priority_score', 'category', 'reason')

    def get_priority_details(self, obj):
        # Only calculate if it's not a pending task or if we want to show it anyway
        result = calculate_priority({
            'importance': obj.importance,
            'deadline': obj.deadline,
            'estimated_time': obj.estimated_time
        })
        return result.get('details')

    def get_is_feasible(self, obj):
        result = calculate_priority({
            'importance': obj.importance,
            'deadline': obj.deadline,
            'estimated_time': obj.estimated_time
        })
        return result.get('feasible')

    def validate_importance(self, value):
        if not (1 <= value <= 10):
            raise serializers.ValidationError("Importance must be between 1 and 10.")
        return value

    def validate_estimated_time(self, value):
        if value <= 0:
            raise serializers.ValidationError("Estimated time must be positive.")
        return value
