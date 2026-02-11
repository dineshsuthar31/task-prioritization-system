from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .logic import calculate_priority
from .models import Task

class LogicTests(TestCase):
    def test_calculate_priority_high(self):
        task = {
            "title": "High Importance, Urgent",
            "importance": 9,
            "deadline": 1,
            "estimated_time": 2
        }
        result = calculate_priority(task)
        self.assertGreaterEqual(result['priority_score'], 70)
        self.assertEqual(result['category'], "High Priority")

    def test_calculate_priority_low(self):
        task = {
            "title": "Low Importance, Not Urgent",
            "importance": 2,
            "deadline": 30,
            "estimated_time": 5
        }
        result = calculate_priority(task)
        self.assertLess(result['priority_score'], 40)
        self.assertEqual(result['category'], "Low Priority")

    def test_impossible_task(self):
        task = {
            "title": "Impossible",
            "importance": 10,
            "deadline": 1,
            "estimated_time": 20 # > 8 hours
        }
        result = calculate_priority(task)
        self.assertEqual(result['category'], "Impossible")

class ViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create initial tasks in DB
        Task.objects.create(title="Task 1", importance=8, deadline=2, estimated_time=2)
        Task.objects.create(title="Task 2", importance=3, deadline=20, estimated_time=5)

    def test_prioritize_endpoint(self):
        url = reverse('prioritize')
        # The endpoint now uses DB, so we don't need to post data, but we can't post a list anymore
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Check if sorted: Task 1 (High priority) should be first
        self.assertGreater(response.data[0]['priority_score'], response.data[1]['priority_score'])

    def test_validate_endpoint(self):
        url = reverse('validate')
        data = [{"title": "Valid", "importance": 5, "deadline": 5, "estimated_time": 2}]
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'valid')

    def test_validate_invalid(self):
        url = reverse('validate')
        data = [{"title": "Invalid", "importance": 11, "deadline": 5, "estimated_time": 2}] # Importance > 10
        response = self.client.post(url, data, format='json')
        # Expect 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
