# CI/CD Pipelines

This directory contains GitHub Actions workflows for Continuous Integration and Continuous Deployment (CI/CD) of the Study Abroad System.

## Available Workflows

```
.github/workflows/
├── full-deploy.yml           # Complete automated deployment triggered by admin, includes infra and backend
└── public-s3-bucket.yml      # Frontend-only auto deployment on push
```

## Workflow Descriptions

### deploy.yml

A general-purpose deployment workflow that can be used for partial deployments or specific components.

**Triggers:**
- Manual workflow dispatch
- Push to specific branches (configurable)

**Actions:**
- Terraform validation and planning
- Infrastructure deployment based on parameters
- Notifications on completion

### full-deploy.yml

A comprehensive deployment workflow that provisions all infrastructure components and deploys both frontend and backend.

**Triggers:**
- Manual workflow dispatch
- Scheduled runs (optional)
- Push to main branch

**Actions:**
- Checkout the code
- Set up Terraform environment
- Validate Terraform configuration
- Plan Terraform changes
- Apply Terraform changes
- Build and package Lambda functions
- Deploy Lambda code
- Deploy frontend files to S3
- Invalidate CloudFront cache
- Run tests (optional)
- Send deployment notifications

### full-deploy-admin.yml

Similar to full-deploy.yml but with additional privileges and options for administrators.

**Triggers:**
- Manual workflow dispatch by administrators only

**Actions:**
- All actions from full-deploy.yml
- Additional administrative tasks
- Database operations (optional)
- Advanced configuration options

### public-s3-bucket.yml

A focused workflow for deploying only the frontend assets to S3.

**Triggers:**
- Manual workflow dispatch
- Push to frontend-related branches
- Changes in the public/ directory

**Actions:**
- Checkout the code
- Configure AWS credentials
- Build frontend assets (if needed)
- Sync files to S3 bucket
- Invalidate CloudFront cache

## Workflow Configuration

### Required Secrets

The following GitHub Secrets must be configured for the workflows to function:

- `AWS_ACCESS_KEY_ID`: AWS access key with appropriate permissions
- `AWS_SECRET_ACCESS_KEY`: Corresponding secret key
- `AWS_S3_BUCKET`: S3 bucket name for Terraform state or frontend
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID for cache invalidation

### Optional Secrets

- `AWS_REGION`: AWS region for deployment (defaults to us-west-2)
- `TERRAFORM_VERSION`: Specific version of Terraform to use
- `NOTIFICATION_EMAIL`: Email address for deployment notifications
- `SLACK_WEBHOOK_URL`: Webhook URL for Slack notifications

## Usage

### Running Workflows Manually

1. Go to the repository on GitHub
2. Click on the "Actions" tab
3. Select the desired workflow
4. Click "Run workflow"
5. Fill in any required parameters
6. Click "Run workflow" again to start the deployment

### Full Deployment Process

For a complete deployment of the system, follow these steps:

1. Go to the GitHub repository
2. Navigate to the Actions tab
3. Select "Full Deploy Pipeline"
4. Click "Run workflow"
5. Monitor the deployment progress
6. Check the AWS Console to verify the resources are created
7. Test the application endpoints

### Frontend-Only Updates

For quick updates to just the frontend assets:

1. Go to the GitHub repository
2. Navigate to the Actions tab
3. Select "Deploy frontend to S3 Bucket"
4. Click "Run workflow"
5. Monitor the deployment progress
6. Test the website through the CloudFront URL

## Troubleshooting

### Common Issues

1. **Workflow fails with AWS credential errors**:
   - Verify that the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets are correctly set
   - Ensure the IAM user has sufficient permissions

2. **Terraform errors during apply**:
   - Check the Terraform logs in the workflow output
   - Ensure the Terraform state is not locked by another process
   - Verify that the resource quotas are not exceeded

3. **S3 upload failures**:
   - Check bucket permissions
   - Ensure the AWS credentials have S3 access
   - Verify that the bucket exists in the specified region

4. **CloudFront invalidation failures**:
   - Verify the CLOUDFRONT_DISTRIBUTION_ID secret is correct
   - Ensure the AWS credentials have CloudFront permissions

### Contacting Support

If you encounter issues that you cannot resolve, please:

1. Open an issue in the GitHub repository with:
   - The name of the failing workflow
   - The error message
   - Steps to reproduce
   - Any additional context

2. Tag the repository administrators for prompt assistance

## Extending Workflows

### Adding New Steps

To add new steps to an existing workflow:

1. Edit the workflow YAML file
2. Add steps under the appropriate job
3. Test the changes in a branch before merging to main

### Creating New Workflows

To create a new workflow:

1. Create a new YAML file in the .github/workflows/ directory
2. Follow the GitHub Actions syntax
3. Reference existing workflows for patterns and best practices
4. Test thoroughly before relying on it for production deployments

## Best Practices

1. Always run Terraform plan before apply to review changes
2. Use specific versions for actions and Terraform to ensure consistency
3. Limit workflow triggers to avoid unnecessary deployments
4. Include meaningful commit messages to help track deployment causes
5. Use environment-specific variables for multi-environment deployments
6. Review workflow logs after deployment to catch warnings or issues
