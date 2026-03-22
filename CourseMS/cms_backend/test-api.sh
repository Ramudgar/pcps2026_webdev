#!/bin/bash
set -e

echo "Starting server in background..."
# use NODE_ENV=development PORT=8083 to avoid conflicting with anything else
NODE_ENV=development PORT=8083 node server.js &
SERVER_PID=$!

# Wait for server to start
sleep 4

API_URL="http://localhost:8083/api"
EMAIL="student_$(date +%s)@example.com"
TEACHER_EMAIL="teacher_$(date +%s)@example.com"

echo "============================================="
echo "1. Testing Student Registration..."
REG_RESP=$(curl -s -X POST "$API_URL/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Student\",\"email\":\"$EMAIL\",\"password\":\"password123\",\"role\":\"student\"}")

echo "$REG_RESP" | grep -q '"success":true' && echo "✅ Registration OK" || (echo "❌ Registration FAILED: $REG_RESP"; kill $SERVER_PID; exit 1)

echo "---------------------------------------------"
echo "2. Testing Login..."
LOGIN_RESP=$(curl -s -X POST "$API_URL/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password123\"}")

echo "$LOGIN_RESP" | grep -q '"success":true' && echo "✅ Login OK" || (echo "❌ Login FAILED: $LOGIN_RESP"; kill $SERVER_PID; exit 1)

TOKEN=$(echo "$LOGIN_RESP" | grep -oP '"token":"\K([^"]+)')

echo "---------------------------------------------"
echo "3. Testing Get Profile..."
PROFILE_RESP=$(curl -s -X GET "$API_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "$PROFILE_RESP" | grep -q '"success":true' && echo "✅ Get Profile OK" || (echo "❌ Get Profile FAILED: $PROFILE_RESP"; kill $SERVER_PID; exit 1)

echo "---------------------------------------------"
echo "4. Testing Avatar Upload (Multer)..."
# Create dummy image
echo "dummy image content" > test_avatar.jpg

AVATAR_RESP=$(curl -s -X PATCH "$API_URL/users/avatar" \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@test_avatar.jpg;type=image/jpeg")

echo "$AVATAR_RESP" | grep -q '"success":true' && echo "✅ Avatar Upload OK" || (echo "❌ Avatar Upload FAILED: $AVATAR_RESP"; kill $SERVER_PID; exit 1)

rm test_avatar.jpg

echo "---------------------------------------------"
echo "5. Testing Teacher Registration & Course Creation..."
T_REG_RESP=$(curl -s -X POST "$API_URL/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Teacher\",\"email\":\"$TEACHER_EMAIL\",\"password\":\"password123\",\"role\":\"teacher\"}")

T_LOGIN_RESP=$(curl -s -X POST "$API_URL/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEACHER_EMAIL\",\"password\":\"password123\"}")
T_TOKEN=$(echo "$T_LOGIN_RESP" | grep -oP '"token":"\K([^"]+)')

COURSE_RESP=$(curl -s -X POST "$API_URL/courses" \
  -H "Authorization: Bearer $T_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Mastering JS\",\"description\":\"Learn JS from scratch\",\"category\":\"Programming\",\"price\":0,\"status\":\"published\"}")

echo "$COURSE_RESP" | grep -q '"success":true' && echo "✅ Course Creation OK" || (echo "❌ Course Creation FAILED: $COURSE_RESP"; kill $SERVER_PID; exit 1)

COURSE_ID=$(echo "$COURSE_RESP" | grep -oP '"_id":"\K([^"]+)' | head -n 1)

echo "---------------------------------------------"
echo "6. Testing Enroll In Course..."
ENROLL_RESP=$(curl -s -X POST "$API_URL/courses/$COURSE_ID/enroll" \
  -H "Authorization: Bearer $TOKEN")

echo "$ENROLL_RESP" | grep -q '"success":true' && echo "✅ Course Enrollment OK" || (echo "❌ Course Enrollment FAILED: $ENROLL_RESP"; kill $SERVER_PID; exit 1)

echo "---------------------------------------------"
echo "7. Testing Get Enrolled Courses..."
MY_COURSES_RESP=$(curl -s -X GET "$API_URL/courses/my-enrollments" \
  -H "Authorization: Bearer $TOKEN")

echo "$MY_COURSES_RESP" | grep -q '"success":true' && echo "✅ Get Enrolled Courses OK" || (echo "❌ Get Enrolled Courses FAILED: $MY_COURSES_RESP"; kill $SERVER_PID; exit 1)

echo "============================================="
echo "✅ ALL TESTS PASSED SUCCESSFULLY!"
kill $SERVER_PID
