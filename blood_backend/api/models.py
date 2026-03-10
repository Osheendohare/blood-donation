# api/models.py
import random
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    father_name = models.CharField(max_length=100)
    ward = models.CharField(max_length=20)
    address = models.TextField()
    muhalla = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    age = models.FloatField()
    y = models.CharField(max_length=100)  # not clear what this means
    gender = models.CharField(max_length=10)
    blood_group = models.CharField(max_length=5)
    rh = models.CharField(max_length=5)
    occupation = models.CharField(max_length=100)
    mobile = models.CharField(max_length=20)
    password = models.CharField(max_length=128, blank=True, null=True)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith("pbkdf2_"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'father_name', 'ward', 'address', 'age', 'gender', 'blood_group', 'mobile', 'latitude', 'longitude'],
                name='unique_user_profile_combination'
            )
        ]

class EmergencyRequest(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, unique=True)
    blood_group = models.CharField(max_length=5)
    ward = models.CharField(max_length=100)
    password = models.CharField(max_length=128)  # hashed password
    created_at = models.DateTimeField(auto_now_add=True)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

class HealthEligibility(models.Model):
    onMedication = models.CharField(max_length=5)
    medicationDetails = models.TextField(blank=True, null=True)
    chronicConditions = models.TextField(blank=True, null=True)
    recentFever = models.CharField(max_length=5)
    underageOrUnderweight = models.CharField(max_length=5)
    consent = models.BooleanField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Health Form {self.id} - {self.submitted_at}"

class BloodCenter(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    contact = models.CharField(max_length=20)
    city = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} – {self.city}"


class Appointment(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    center = models.ForeignKey(BloodCenter, on_delete=models.CASCADE)
    date = models.DateField()

    def __str__(self):
        return f"{self.user_profile.name} – {self.center.name} on {self.date}"
    
class EmergencyAppointment(models.Model):
    user_profile = models.ForeignKey(EmergencyRequest, on_delete=models.CASCADE)
    center = models.ForeignKey(BloodCenter, on_delete=models.CASCADE)
    date = models.DateField()

    def __str__(self):
        return f"{self.user_profile.name} – {self.center.name} on {self.date}"

class CampRegistration(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    camp_name = models.CharField(max_length=150)
    city = models.CharField(max_length=100)
    date = models.DateField()

    def __str__(self):
        return f"{self.user_profile.name} - {self.camp_name} ({self.city})"

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15)
    message = models.TextField()

    def __str__(self):
        return f"{self.name} ({self.mobile})"

class SuggestedDonor(models.Model):
    receiver = models.ForeignKey(EmergencyRequest, on_delete=models.CASCADE)  # ✅
    donor = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('receiver', 'donor')
