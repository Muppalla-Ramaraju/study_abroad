# Infrastructure as Code (Terraform)

This directory contains the Terraform configuration for deploying the Study Abroad System infrastructure to AWS. The infrastructure is defined using a modular approach, allowing for flexible and maintainable deployments.

## Directory Structure

```
terraform-project/
├── main.tf                 # Root configuration file
├── outputs.tf              # Output definitions
├── providers.tf            # AWS provider configuration
├── terraform.tfvars        # Variable values
├── variables.tf            # Variable declarations
├── modules/                # Reusable infrastructure components
│   ├── apigateway/         # API Gateway module
│   ├── apigateway-studyabroad/ # Study Abroad API Gateway
│   ├── cloudfront/         # CloudFront distribution
│   ├── cognito/            # User authentication
│   ├── dynamodb/           # Database tables
│   ├── lambda-auth/        # Authentication Lambda functions
│   ├── lambda-classes/     # Class management Lambda functions
│   ├── lambda-faculty/     # Faculty functionality Lambda functions
│   ├── lambda-students/    # Student functionality Lambda functions
│   ├── lambda-loc-notify/  # Location notification Lambda functions
│   ├── s3/                 # Static website hosting
│   └── sns/                # Notification service
```

## Infrastructure Components

The Study Abroad System infrastructure consists of the following AWS services, each defined in its own module:

### Storage & Database

- **Amazon S3** (modules/s3)
  - Hosts static website content (HTML, CSS, JS)
  - Configured with appropriate bucket policies for secure access

- **Amazon DynamoDB** (modules/dynamodb)
  - Creates tables:
    - UserProfiles: Stores user information
    - Locations: Stores student check-in data
    - ClassesTrips: Stores class and trip information
  - Configures DynamoDB Streams for real-time processing

### Compute & Serverless

- **AWS Lambda** (modules/lambda-*)
  - Different modules for different function categories:
    - lambda-auth: Authentication functions
    - lambda-classes: Class management functions
    - lambda-faculty: Faculty functionality
    - lambda-students: Student functionality
    - lambda-loc-notify: Location notifications
  - Each module creates Lambda functions with appropriate IAM roles and policies

### API & Networking

- **Amazon API Gateway** (modules/apigateway-studyabroad)
  - Defines REST API endpoints
  - Configures Lambda integrations
  - Sets up CORS policies
  - Creates deployment stages

- **Amazon CloudFront** (modules/cloudfront)
  - Creates a CDN distribution for the S3 website
  - Configures HTTPS with a custom SSL certificate
  - Sets up caching policies

### Identity & Access

- **Amazon Cognito** (modules/cognito)
  - Creates User Pool for authentication
  - Sets up app clients
  - Configures password policies and MFA options

### Notifications

- **Amazon SNS** (modules/sns)
  - Creates topics for notifications:
    - Faculty emergency notifications
    - Student check-in notifications
  - Configures subscription filters and policies

## Deployment Instructions

### Prerequisites

1. AWS account with programmatic access
2. Terraform CLI v1.6.0 or later
3. AWS CLI configured with appropriate credentials
4. S3 bucket for Terraform state (if using remote backend)

### Configuration

1. Update `terraform.tfvars` with appropriate values:
   - `aws_region`: AWS region to deploy resources
   - `environment`: Deployment environment (dev, staging, prod)
   - `project_name`: Project identifier
   - Other service-specific configuration values

2. (Optional) Configure remote backend in `providers.tf` for team environments

### Deployment Steps

#### Option 1: Manual Deployment

```bash
# Initialize Terraform (download providers and modules)
terraform init

# Validate configuration
terraform validate

# Plan the deployment
terraform plan -out=deployment.tfplan

# Apply the deployment
terraform apply deployment.tfplan
```

#### Option 2: GitHub Actions Deployment

The system can be deployed automatically via GitHub Actions using the workflows defined in `.github/workflows/`.

For step-by-step instructions, see the [Administrator Deployment Documentation](../docs/admin_deployment.md).

### Destroying Infrastructure

To tear down the infrastructure:

```bash
terraform destroy
```

**CAUTION**: This will remove all resources. If you have valuable data in DynamoDB tables, back it up before running this command.

## Module Descriptions

### apigateway/ & apigateway-studyabroad/

Creates and configures the API Gateway, including:
- REST API definition
- Resource paths and methods
- Lambda integrations
- CORS configuration
- Deployment stages

### cloudfront/

Sets up the CloudFront distribution to serve the frontend:
- Origin configuration (S3 bucket)
- Cache behaviors
- SSL certificate
- Default root object

### cognito/

Configures the user authentication system:
- User Pool with attributes
- App client settings
- Password policies
- MFA configuration

### dynamodb/

Creates the database tables:
- Table definitions with keys
- Capacity settings
- Stream configurations
- GSI and LSI indexes

### lambda-*/

Each Lambda module creates functions for specific categories:
- Function definitions
- IAM roles and policies
- Environment variables
- Event source mappings

### s3/

Sets up the S3 bucket for static hosting:
- Bucket configuration
- Public access settings
- Website configuration
- CORS settings

### sns/

Configures notification topics:
- Topic creation
- Subscription policies
- Access policies

## Variables Reference

See `variables.tf` for a complete list of variables used in the configuration. Key variables include:

- `aws_region`: AWS region for resource deployment
- `environment`: Deployment environment (dev, staging, prod)
- `project_name`: Name used for resource tagging and identification
- `cognito_user_pool_name`: Name of the Cognito User Pool
- `dynamodb_table_names`: Names for DynamoDB tables
- `lambda_timeout`: Default timeout for Lambda functions
- `lambda_memory_size`: Default memory allocation for Lambda functions

## Outputs

After successful deployment, the following outputs are available:

- CloudFront distribution domain
- API Gateway invocation URL
- Cognito User Pool ID and App Client ID
- S3 website bucket name
- SNS topic ARNs

These can be viewed in the Terraform output or used programmatically for application configuration.

## Best Practices

1. Use the provided modules rather than creating resources directly in main.tf
2. Keep sensitive information in AWS Secrets Manager or use tfvars files (not in version control)
3. Use consistent tagging for all resources
4. Leverage GitHub Actions for automated deployments
5. Review the security settings regularly, especially IAM policies
