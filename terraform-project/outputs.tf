# Outputs for the Cognito module
output "user_pool_id" {
  value = module.cognito.user_pool_id
}

output "user_pool_client_id" {
  value = module.cognito.user_pool_client_id
}

output "user_pool_client_id_secret" {
  value = module.cognito.user_pool_client_id_secret
  sensitive = true
}

# Outputs for the DynamoDB module
output "dynamodb_output" {
  value = {
    classes_trips_table_name = module.dynamodb.classes_trips_table_name
    locations_table_name     = module.dynamodb.locations_table_name
    user_profiles_table_name = module.dynamodb.user_profiles_table_name
  }
}
