from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from twilio.rest import Client
import random
from django.conf import settings
from .utils import haversine 
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password
from .models import UserProfile, EmergencyRequest, BloodCenter, Appointment, CampRegistration, ContactMessage,SuggestedDonor, EmergencyAppointment
from .serializers import (
    UserProfileSerializer,
    RegisterSerializer,
    LoginSerializer,
    DonorSerializer,
    EmergencyRequestSerializer,
    EmergencyLoginSerializer,
    HealthEligibilitySerializer,  BloodCenterSerializer, AppointmentSerializer, CampRegistrationSerializer, ContactMessageSerializer, EmergencyAppointmentSerializer
)

@api_view(['POST'])
def register_user(request):
    data = request.data

    # Basic duplicate check by mobile number only (more reliable & user-friendly)
    if UserProfile.objects.filter(mobile=data.get('mobile')).exists():
        return Response({"error": "User with this mobile number already exists"}, status=400)

    # Hash the password before saving
    if 'password' in data:
        data['password'] = make_password(data['password'])

    serializer = RegisterSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_user(request):
    mobile = request.data.get('mobile')
    password = request.data.get('password')

    if not mobile or not password:
        return Response({'error': 'Mobile and password are required'}, status=400)

    try:
        user = UserProfile.objects.get(mobile=mobile)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    if check_password(password, user.password):
        return Response({'message': 'Login successful', 'id': user.id})
    else:
        return Response({'error': 'Invalid credentials'}, status=400)


# List all user profiles (can be used to fetch donors)
@api_view(['GET'])
def all_users(request):
    users = UserProfile.objects.all()
    serializer = UserProfileSerializer(users, many=True)
    return Response(serializer.data)

# Suggestion history - list and create
# @api_view(['GET', 'POST'])
# def suggestion_history(request):
#     if request.method == 'GET':
#         suggestions = SuggestionHistory.objects.all()
#         serializer = SuggestionHistorySerializer(suggestions, many=True)
#         return Response(serializer.data)

#     elif request.method == 'POST':
#         serializer = SuggestionHistorySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'message': 'Suggestion saved.'}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_emergency_request(request):
    mobile = request.data.get('mobile')
    if mobile and EmergencyRequest.objects.filter(mobile=mobile).exists():
        return Response(
            {"error": "User with this mobile number already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = EmergencyRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': '🚨 Emergency request created successfully.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'error': '❌ Submission failed. Please check your details.',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def emergency_login(request):
    serializer = EmergencyLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        return Response({'id': user.id}, status=status.HTTP_200_OK)
    return Response({'error': '❌ Invalid login.', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def all_emergency_users(request):
    users = EmergencyRequest.objects.all()
    serializer = EmergencyRequestSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def donor_health_form(request):
    serializer = HealthEligibilitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Health form submitted.'}, status=status.HTTP_201_CREATED)
    return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_centers(request):
    centers = BloodCenter.objects.all()
    serializer = BloodCenterSerializer(centers, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def book_appointment(request):
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Appointment booked successfully!"})
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def emergency_appointment(request):
    serializer = EmergencyAppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Appointment booked successfully!"})
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def register_camp(request):
    serializer = CampRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': '✅ Registered for camp successfully!'})
    return Response(serializer.errors, status=400)
    
@api_view(['POST'])
def submit_contact_message(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Message saved successfully!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def suggest_donors(request, receiver_id):
    try:
        receiver = EmergencyRequest.objects.get(id=receiver_id)
    except EmergencyRequest.DoesNotExist:
        return Response({"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND)

    shown_donor_ids = SuggestedDonor.objects.filter(receiver=receiver).values_list('donor_id', flat=True)

    donors_qs = UserProfile.objects.exclude(id__in=shown_donor_ids)

    # Get lat/lon from query params (frontend may send null if denied)
    try:
        lat = request.query_params.get('latitude')
        lon = request.query_params.get('longitude')
        lat = float(lat) if lat else None
        lon = float(lon) if lon else None
    except:
        lat = lon = None

    suggestions = []

    if lat is not None and lon is not None:
        # Use geolocation to filter nearby donors
        for donor in donors_qs.exclude(latitude__isnull=True).exclude(longitude__isnull=True):
            distance = haversine(lat, lon, donor.latitude, donor.longitude)
            if distance <= 10:  # 10 km radius
                suggestions.append({
                    "id": donor.id,
                    "name": donor.name,
                    "blood_group": donor.blood_group,
                    "rh": getattr(donor, 'rh', ''),
                    "ward": donor.ward,
                    "mobile": donor.mobile,
                    "distance": round(distance, 2)
                })
        # Sort by distance
        suggestions.sort(key=lambda x: x['distance'])

    # Fallback to ward-based suggestions if geolocation denied or no nearby donors
    if not suggestions:
        ward_donors = donors_qs.filter(ward=receiver.ward)[:10]
        for donor in ward_donors:
            suggestions.append({
                "id": donor.id,
                "name": donor.name,
                "blood_group": donor.blood_group,
                "rh": getattr(donor, 'rh', ''),
                "ward": donor.ward,
                "mobile": donor.mobile,
                "distance": None  # unknown
            })

    # Save suggested donors
    for donor in suggestions:
        SuggestedDonor.objects.get_or_create(receiver=receiver, donor_id=donor['id'])

    return Response(suggestions[:10], status=status.HTTP_200_OK)


@api_view(['POST'])
def send_otp(request):
    mobile = request.data.get('mobile')
    if not mobile:
        return Response({'error': 'Mobile number is required'}, status=400)

    try:
        user = UserProfile.objects.get(mobile=mobile)
        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()

        # Twilio client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"🔐 Your OTP for password reset is: {otp}",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=f'+91{mobile}'  # ensure proper format
        )

        return Response({'message': 'OTP sent successfully via SMS'})

    except UserProfile.DoesNotExist:
        return Response({'error': 'User with this mobile does not exist'}, status=404)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def reset_password_with_otp(request):
    mobile = request.data.get('mobile')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')

    try:
        user = UserProfile.objects.get(mobile=mobile, otp=otp)
        # Optional: check if OTP expired (e.g., 5 min window)
        user.set_password(new_password)
        user.otp = None
        user.otp_created_at = None
        user.save()
        return Response({'message': 'Password reset successfully'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'Invalid OTP or user'}, status=400)

@api_view(['POST'])
def send_emergency_otp(request):
    mobile = request.data.get('mobile', '').strip()[-10:]  # Normalize to last 10 digits

    if not mobile or len(mobile) != 10 or not mobile.isdigit():
        return Response({'error': 'Valid 10-digit mobile number is required'}, status=400)

    # Match last 10 digits
    user = EmergencyRequest.objects.filter(mobile__regex=r'(\d{0,2})?' + mobile).first()
    if not user:
        return Response({'error': 'No emergency user found with this mobile'}, status=404)

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_created_at = timezone.now()
    user.save()

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"🔐 Emergency login OTP: {otp}",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=f'+91{mobile}'
        )
        return Response({'message': 'OTP sent successfully via SMS'})
    except Exception as e:
        return Response({'error': f'SMS failed: {str(e)}'}, status=500)


@api_view(['POST'])
def reset_emergency_password_with_otp(request):
    mobile = request.data.get('mobile')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')

    try:
        user = EmergencyRequest.objects.get(mobile=mobile, otp=otp)
        user.set_password(new_password)
        user.otp = None
        user.otp_created_at = None
        user.save()
        return Response({'message': 'Password reset successfully'})
    except EmergencyRequest.DoesNotExist:
        return Response({'error': 'Invalid OTP or user'}, status=400)