from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Task
from .serializers import TaskSerializer
from .logic import calculate_priority

class TaskListCreateView(generics.ListCreateAPIView):
    """
    GET: List all incomplete tasks from DB (sorted by priority).
    POST: Create a new task in DB.
    """
    def get_queryset(self):
        # We generally want to see uncompleted tasks first, or all tasks?
        # Let's show completed tasks at the bottom or filter them out in the frontend.
        # But wait, user asked "kese complete kr skta hun", so we need to see them to complete them.
        # Let's return all, but sorted.
        return Task.objects.all().order_by('is_completed', '-priority_score', 'deadline', '-importance')
    
    serializer_class = TaskSerializer

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE: Manage a single task.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class PrioritizeTasksView(APIView):
    """
    POST: Accepts a list of tasks OR recalculates DB tasks.
    Returns scored and categorized tasks.
    """
    def post(self, request):
        input_data = request.data
        tasks_to_process = []
        is_stateless = False

        if isinstance(input_data, list) and len(input_data) > 0:
            serializer = TaskSerializer(data=input_data, many=True)
            if serializer.is_valid():
                tasks_to_process = serializer.validated_data
                is_stateless = True
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            tasks_to_process = list(Task.objects.filter(is_completed=False))

        results = []
        updated_db_instances = []

        for task in tasks_to_process:
            # Handle both dict (from serializer) and model instance
            is_model = isinstance(task, Task)
            task_dict = {
                'id': task.id if is_model else task.get('id'),
                'title': task.title if is_model else task.get('title'),
                'deadline': task.deadline if is_model else task.get('deadline'),
                'estimated_time': task.estimated_time if is_model else task.get('estimated_time'),
                'importance': task.importance if is_model else task.get('importance')
            }
            
            scored_task = calculate_priority(task_dict)
            results.append(scored_task)

            if is_model:
                task.priority_score = scored_task['priority_score']
                task.category = scored_task['category']
                task.reason = scored_task.get('reason', '')
                updated_db_instances.append(task)
        
        if updated_db_instances:
            Task.objects.bulk_update(updated_db_instances, ['priority_score', 'category', 'reason'])
        
        # Sort results: Score (desc), Deadline (asc), Importance (desc)
        results.sort(key=lambda x: (-x['priority_score'], x['deadline'] or 0, -x['importance']))
        
        return Response(results, status=status.HTTP_200_OK)

class ValidateTasksView(APIView):
    """
    POST: Separates valid and invalid tasks with reasons.
    """
    def post(self, request):
        tasks = request.data
        if not isinstance(tasks, list):
            return Response({"error": "Expected a list of tasks"}, status=status.HTTP_400_BAD_REQUEST)

        valid_tasks = []
        invalid_tasks = []

        for item in tasks:
            serializer = TaskSerializer(data=item)
            if serializer.is_valid():
                valid_tasks.append(serializer.validated_data)
            else:
                invalid_tasks.append({
                    "task": item,
                    "errors": serializer.errors
                })

        return Response({
            "valid_count": len(valid_tasks),
            "invalid_count": len(invalid_tasks),
            "valid_tasks": valid_tasks,
            "invalid_tasks": invalid_tasks
        }, status=status.HTTP_200_OK)

class TaskPrioritizeIndividualView(APIView):
    """
    POST: Prioritizes a specific task by its ID and returns the updated task.
    """
    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
            if task.is_completed:
                return Response({"error": "Cannot prioritize a completed task"}, status=status.HTTP_400_BAD_REQUEST)
            
            task_data = {
                'id': task.id,
                'title': task.title,
                'deadline': task.deadline,
                'estimated_time': task.estimated_time,
                'importance': task.importance
            }
            
            result = calculate_priority(task_data)
            
            task.priority_score = result['priority_score']
            task.category = result['category']
            task.reason = result.get('reason', '')
            task.save()
            
            serializer = TaskSerializer(task)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "healthy", "service": "Task Prioritization System"}, status=status.HTTP_200_OK)
