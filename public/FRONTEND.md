# Frontend Documentation

This directory contains all the frontend assets for the Study Abroad System, including HTML, CSS, and JavaScript files that power the user interfaces for students, faculty, and administrators.

## Directory Structure

```
public/
├── css/                       # Stylesheets for all pages
│   ├── admin-styles.css       # Admin dashboard styling
│   ├── class-details-styles.css # Class management styling
│   ├── faculty-styles.css     # Faculty dashboard styling
│   ├── login-styles.css       # Login page styling
│   ├── main.css               # Common styles shared across pages
│   ├── profile-styles.css     # User profile styling
│   ├── reset-password.css     # Password reset styling
│   ├── signup-styles.css      # Sign-up page styling
│   ├── student-styles.css     # Student dashboard styling
│   └── verify-styles.css      # Account verification styling
├── js/                        # JavaScript logic
│   ├── admin.js               # Admin dashboard logic
│   ├── class-details.js       # Class management logic
│   ├── create-status.js       # Custom status creation logic
│   ├── faculty.js             # Faculty dashboard logic
│   ├── fetch-status.js        # Status retrieval logic
│   ├── login.js               # Authentication logic
│   ├── notify-students.js     # Student notification logic
│   ├── profile.js             # User profile management
│   ├── reset-password.js      # Password reset logic
│   ├── session.js             # Session management utilities
│   ├── signup.js              # Registration logic
│   ├── student.js             # Student dashboard logic
│   ├── ui-utils.js            # Common UI utilities
│   └── verify.js              # Account verification logic
├── admin.html                 # Admin dashboard page
├── class-details.html         # Class management page
├── faculty.html               # Faculty dashboard page
├── index.html                 # Landing page
├── login.html                 # Login page
├── profile.html               # User profile page
├── resetpwd.html              # Password reset page
├── signup.html                # Registration page
├── student.html               # Student dashboard page
└── verify.html                # Account verification page
```

## Pages Overview

### Authentication Pages

- **login.html**: User login interface
- **signup.html**: New user registration
- **verify.html**: Account verification after signup
- **resetpwd.html**: Password reset functionality

### Dashboard Pages

#### Student Dashboard (student.html)

The Student Dashboard provides students with tools to:

- Update their current location using geolocation
- Select peers they are with
- Choose from custom check-in statuses (e.g., "At Hotel", "In Transit")
- Add comments for additional context
- Trigger emergency alerts via the SOS button

Key components:
- Real-time geolocation capture
- Check-in form with dropdown menus
- Emergency SOS button with details modal

#### Faculty Dashboard (faculty.html)

The Faculty Dashboard allows faculty to:

- View real-time student locations
- Refresh student location data
- Send notifications requesting students to check in
- Create custom check-in status options
- Monitor emergency alerts
- View detailed check-in information

Key components:
- Student location table with map links
- Additional details panel for status, place, comments
- Action buttons for notifications and status creation

#### Admin Dashboard (admin.html & class-details.html)

The Admin Dashboard provides system administrators with tools to:

- Create and manage classes/trips
- Add and remove faculty to classes
- Add and remove students to classes
- View class details and current enrollment

Key components:
- Class creation modal
- Class cards displaying basic information
- Class details page for member management

### Profile Management

- **profile.html**: Allows users to view and edit their personal information

## JavaScript Modules

### Core Utilities

- **session.js**: Manages authentication tokens and user sessions
- **ui-utils.js**: Provides common UI manipulation functions

### Feature-Specific Modules

- **create-status.js**: Handles creation of custom check-in status options
- **fetch-status.js**: Retrieves available status options
- **notify-students.js**: Sends check-in notifications to students

## CSS Styling

- Responsive design supporting both desktop and mobile views
- TAMU branding colors and design guidelines
- Consistent styling patterns across all pages

## Usage Guidelines

### Student Dashboard Usage

1. After logging in, students are directed to their dashboard
2. To check in:
   - Click "Get Current Location" to update coordinates
   - Select peers if traveling with others
   - Choose a check-in status
   - Add any comments
   - Click "Check In" to submit
3. In case of emergency, click the "SOS" button and provide details

### Faculty Dashboard Usage

1. After logging in, faculty are directed to their dashboard
2. To view student locations:
   - Click "Refresh Student Locations"
   - View the real-time location table and additional details
3. To request student check-ins:
   - Click "Notify Students to Check-in"
4. To create a new check-in status:
   - Click "Create New Check-in Status"
   - Enter the status label (e.g., "At Museum")
   - Click "Save"

### Admin Dashboard Usage

1. After logging in, administrators are directed to their dashboard
2. To create a new class:
   - Click "+ Create Group"
   - Enter class name and faculty
   - Click "Add Class"
3. To manage a class:
   - Click on a class card to open class details
   - Add or remove students and faculty as needed
   - Use "Save & Exit" to confirm changes

## Development Guidelines

When modifying frontend files:

1. Maintain consistent styling across pages
2. Use session.js for all authentication-related operations
3. Test responsive design on both desktop and mobile viewports
4. Validate form inputs on the client-side before submission
5. Provide clear user feedback for all actions

## Browser Compatibility

The frontend is designed to work with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)
