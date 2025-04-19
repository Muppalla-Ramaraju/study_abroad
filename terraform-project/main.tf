terraform {
  backend "s3" {
    bucket         = "study-abroad-terraform-state-bucket"  # replace with your S3 bucket name
    key            = "study-abroad/terraform.tfstate"   # organize by env if needed
    region         = "us-east-1"                    # this must be hardcoded or parameterized via TF_VAR
    dynamodb_table = "terraform_lock_table"              # optional: for state locking
    encrypt        = true
  }

}

provider "aws" {
  region = var.aws_region
}

module "cognito" {
  source = "./modules/cognito"
  aws_region = var.aws_region
}

module "dynamodb" {
  source = "./modules/dynamodb"
  aws_region = var.aws_region
}
  

