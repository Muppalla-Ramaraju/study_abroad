# Backend Documentation

This directory contains all the AWS Lambda functions powering the Study Abroad System. Each Lambda function handles specific aspects of the application logic, from user authentication to location tracking and notifications.

## Directory Structure

```
backend/
├── AddFacultyinClass.py             # Add faculty to a class
├── AdminAddStudentinClass.py        # Admin functionality to add students
├── AdminDeleteUser.py               # Delete users as admin
├── AdminUserCreation.py             # Create admin users
├── createClasses.py                 # Create new classes/trips
├── createStatus.py                  # Create custom check-in statuses
├── createUser.py                    # User registration
├── deleteClass.py                   # Delete classes
├── FacultyDeletefromClass.py        # Remove faculty from class
├── FacultyEmergencyNotification.py  # Emergency notifications for faculty
├── fetchCustomStatus.py             # Retrieve custom statuses
├── getClass.py                      # Get class information
├── GetFacultyFromClass.py           # List faculty in a class
├── GetFacultyfromUserProfiles.py    # Get faculty profiles
├── GetNameFaculty.py                # Get faculty names
├── getStudents.py                   # List all students
├── GetStudentwithinClass.py         # List students in a class
├── GetStudsfromClassesTrips.py      # Get students from class/trip
├── locationsFaculty.mjs             # Student location data for faculty
├── login.py                         # User authentication
├── notifyStudents.py                # Send check-in notifications
├── RefreshToken.py                  # JWT token refresh
├── resetPassword.py                 # Password reset
├── storeLocation.mjs                # Store student location data
├── StudDeletefromClass.py           # Remove student from class
├── CREATECLASSES/                   # Lambda function deployment package
│   └── lambda_function.py
├── CREATEUSER/                      # Lambda function deployment package
│   └── lambda_function.py
├── LOGIN/                           # Lambda function deployment package
│   └── lambda_function.py
└── RESETPASSWORD/                   # Lambda function deployment package
    └── lambda_function.py
```

## Lambda Functions Overview

The backend is organized into several Lambda functions, each serving a specific purpose within the application:

### Authentication & User Management

- `createUser.py` - Handles user registration with Cognito
- `login.py` - Manages user authentication and session tokens
- `resetPassword.py` - Facilitates password reset workflow
- `RefreshToken.py` - Refreshes JWT tokens for continued sessions

### Class & Trip Management

- `createClasses.py` - Creates new classes/trips in DynamoDB
- `deleteClass.py` - Removes classes from the system
- `getClass.py` - Retrieves class information
- `AddFacultyinClass.py` - Assigns faculty to a class
- `AdminAddStudentinClass.py` - Assigns students to a class
- `FacultyDeletefromClass.py` - Removes faculty from a class
- `StudDeletefromClass.py` - Removes students from a class

### Location & Check-in Services

- `storeLocation.mjs` - Stores student check-in data
- `locationsFaculty.mjs` - Retrieves student locations for faculty view
- `createStatus.py` - Creates custom check-in status options
- `fetchCustomStatus.py` - Retrieves available check-in status options

### Notification Services

- `notifyStudents.py` - Sends check-in requests to students
- `FacultyEmergencyNotification.py` - Sends emergency alerts to faculty

### User Lookup & Listing

- `getStudents.py` - Lists available students
- `GetStudentwithinClass.py` - Lists students in a specific class
- `GetFacultyFromClass.py` - Lists faculty in a specific class
- `GetFacultyfromUserProfiles.py` - Retrieves faculty profile information
- `GetStudsfromClassesTrips.py` - Gets students from classes/trips table

## DynamoDB Tables

The Lambda functions interact with the following DynamoDB tables:

### UserProfiles Table:
- **Partition Key**: `userId`
- Stores user information including name, email, role, etc.

### Locations Table:
- **Partition Key**: `id`
- **Sort Key**: `timestamp`
- Stores student check-in data with location coordinates, time, status, etc.

### ClassesTrips Table:
- **Partition Key**: `classId`
- Stores class/trip information, including faculty and student lists, custom statuses, etc.

## AWS Services Integration

These Lambda functions integrate with several AWS services:

- **Amazon Cognito**: For user authentication and management
- **Amazon DynamoDB**: For data storage and retrieval
- **Amazon SNS**: For notifications (emergency alerts, check-in requests)
- **DynamoDB Streams**: For triggering real-time notifications

## Development Guidelines

When modifying Lambda functions:

1. Maintain consistent error handling across functions
2. Include appropriate CORS headers in all responses
3. Validate input parameters before processing
4. Use environment variables for configuration
5. Test thoroughly before deployment

## Deployment

Lambda functions are deployed via GitHub Actions CI/CD pipelines. See the main Terraform documentation for details on infrastructure provisioning.

## Testing

Each Lambda function can be tested locally using the AWS SAM CLI or directly in the AWS Console Lambda test environment.

Example test event for `createClasses.py`:

```json
{
  "body": "{\"className\":\"Test Class\",\"facultyName\":\"Dr. Smith\"}"
}
```

## Lambda Environment Variables

Most Lambda functions depend on environment variables set during deployment:

- `CLASSES_TABLE` - ClassesTrips DynamoDB table name
- `LOCATIONS_TABLE` - Locations DynamoDB table name
- `USER_PROFILES_TABLE` - UserProfiles DynamoDB table name
- `FACULTY_TOPIC_ARN` - SNS topic ARN for faculty notifications
- `STUDENT_TOPIC_ARN` - SNS topic ARN for student notifications
