# Study Abroad TAMU


![System Architecture]

<img width="540" alt="image" src="https://github.com/user-attachments/assets/a1f42567-148e-411a-9c6d-adb367d7491b" />



# Study Abroad System

The Study Abroad System is a cloud-native application designed to ensure the safety and well-being of students while studying abroad. It provides an integrated communication platform for students, faculty, and administrators, allowing them to track locations, receive notifications, and respond promptly to safety-related alerts.

## Project Overview

This application serves three key user roles:
- **Students** participating in study abroad programs
- **Faculty** responsible for monitoring student safety
- **Administrators** overseeing the deployment and management of the system

## Key Features

- Real-time location tracking for students
- Automated check-ins and notifications
- Emergency alerts and faculty oversight
- Role-based access and system management
- Custom check-in status creation

## Project Structure

```
muppalla-ramaraju-study_abroad/
├── README.md                     # Main project documentation
├── backend/                      # AWS Lambda functions code
│   ├── Various Lambda files      # Each file corresponds to a specific Lambda function
│   └── Subdirectories            # Organized Lambda functions
├── public/                       # Frontend files (HTML, CSS, JS)
│   ├── css/                      # Stylesheets for all pages
│   ├── js/                       # JavaScript logic
│   └── HTML files                # Page templates
├── terraform-project/            # Infrastructure as Code (Terraform)
│   ├── Root Terraform files      # Main deployment configuration
│   └── modules/                  # Modular infrastructure components
└── .github/workflows/           # CI/CD pipelines
```

## Architecture

The system is built using a serverless architecture with:

- **Frontend**: HTML, CSS, JavaScript (hosted in S3, delivered via CloudFront)
- **Backend**: AWS Lambda functions, Amazon API Gateway
- **Database**: Amazon DynamoDB (UserProfiles, Locations, ClassesTrips tables)
- **Authentication**: Amazon Cognito
- **Notifications**: Amazon SNS
- **Infrastructure**: Defined with Terraform
- **CI/CD**: GitHub Actions


## Getting Started

### Prerequisites

1. AWS Account with programmatic access
2. S3 bucket for Terraform state (if using remote backend)
3. Required GitHub Secrets:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_S3_BUCKET
   - CLOUDFRONT_DISTRIBUTION_ID (for frontend cache invalidation)
4. Terraform CLI v1.6+ installed (locally or via GitHub Actions)

### Deployment

The system can be deployed via GitHub Actions:

1. Go to the repository on GitHub
2. Navigate to the Actions tab
3. Choose the "Full Deploy Pipeline" workflow
4. Run the workflow

For more detailed deployment instructions, see the [Administrator Deployment Documentation](./docs/admin_deployment.md).

## Usage

### Student Dashboard

Students can:
- Update their location using geolocation
- Check in with peers
- Select a status (e.g., "At Hotel", "In Transit")
- Add comments for context
- Report emergencies via the SOS button

### Faculty Dashboard

Faculty can:
- View real-time student locations
- Send check-in notifications to students
- Create custom check-in statuses
- Receive emergency alerts
- Access historical check-in data

### Admin Dashboard

Administrators can:
- Create/manage classes and trips
- Assign faculty and students to classes
- Set up and monitor the system

## Documentation

Detailed documentation for each user role:

- [Student Documentation](./public/README.md#student-dashboard)
- [Faculty Documentation](./public/README.md#faculty-dashboard)
- [Admin Documentation](./public/README.md#admin-dashboard)
- [Backend Documentation](./backend/README.md)
- [Infrastructure Documentation](./terraform-project/README.md)

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Backend**: AWS Lambda (Python/Node.js)
- **Database**: Amazon DynamoDB
- **Authentication**: Amazon Cognito
- **API Gateway**: RESTful API endpoints
- **Notifications**: Amazon SNS
- **Storage**: Amazon S3
- **CDN**: Amazon CloudFront
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Texas A&M University Mays Business School
- Study Abroad Program
