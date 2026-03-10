from rest_framework import serializers
from .models import UserProfile, EmergencyRequest, HealthEligibility, BloodCenter, Appointment, EmergencyAppointment, CampRegistration, ContactMessage, SuggestedDonor
from django.contrib.auth.hashers import make_password, check_password

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        exclude = ['password']  # hide password in response

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
    
class LoginSerializer(serializers.Serializer):
    contact = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        contact = data.get('contact')
        password = data.get('password')

        if not contact :
            raise serializers.ValidationError("Contact is required.")

        try:
            if contact:
                user = UserProfile.objects.get(mobile=contact)
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if not check_password(password, user.password):
            raise serializers.ValidationError("Invalid password.")

        data['user'] = user
        return data

# class SuggestionHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SuggestionHistory
#         fields = '__all__'

class EmergencyRequestSerializer(serializers.ModelSerializer):
    confirmPassword = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = EmergencyRequest
        fields = ['id', 'name', 'mobile', 'blood_group', 'ward', 'password', 'confirmPassword', 'latitude', 'longitude']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data.get('password') != data.get('confirmPassword'):
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class EmergencyLoginSerializer(serializers.Serializer):
    mobile = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        mobile = data.get('mobile')
        password = data.get('password')

        try:
            user = EmergencyRequest.objects.get(mobile=mobile)
        except EmergencyRequest.DoesNotExist:
            raise serializers.ValidationError("Mobile number not found.")

        if not check_password(password, user.password):
            raise serializers.ValidationError("Incorrect password.")

        data['user'] = user
        return data
    
class HealthEligibilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthEligibility
        fields = '__all__'

class BloodCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodCenter
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields =  ['id', 'user_profile', 'center', 'date']

class EmergencyAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyAppointment
        fields =  ['id', 'user_profile', 'center', 'date']

class CampRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampRegistration
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class DonorSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'name', 'blood_group', 'rh', 'ward', 'mobile']