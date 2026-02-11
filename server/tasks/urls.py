from django.urls import path
from .views import TaskListCreateView, TaskDetailView, TaskPrioritizeIndividualView, PrioritizeTasksView, ValidateTasksView, HealthCheckView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('<int:pk>/prioritize/', TaskPrioritizeIndividualView.as_view(), name='task-prioritize-individual'),
    path('prioritize', PrioritizeTasksView.as_view(), name='prioritize'),
    path('validate', ValidateTasksView.as_view(), name='validate'),
    path('health', HealthCheckView.as_view(), name='health'),
]
