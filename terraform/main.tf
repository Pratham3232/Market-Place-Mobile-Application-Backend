
# Auth Service
module "auth" {
  source                       = "./modules/container_app"
  name                         = var.auth_container
  image                        = var.auth_image
  rg_name                      = var.rg_name
  container_app_env_name       = var.container_app_env_name
  acr_name                     = var.acr_name
  cpu                          = 0.5
  memory                       = "1Gi"
  database_url                 = var.database_url
  enable_ingress               = true
  target_port                  = 3000
  min_replicas                 = 1
  max_replicas                 = 5
  twilio_account_sid           = var.twilio_account_sid
  twilio_auth_token            = var.twilio_auth_token
  twilio_messaging_service_sid = var.twilio_messaging_service_sid
  twilio_phone_number          = var.twilio_phone_number
  env_vars = {
    RABBITMQ_HOST = var.rabbitmq_container
    REDIS_HOST    = var.redis_container
    PORT          = "3000"
  }
}

# Providers Service
module "providers" {
  source                       = "./modules/container_app"
  name                         = var.providers_container
  image                        = var.providers_image
  rg_name                      = var.rg_name
  container_app_env_name       = var.container_app_env_name
  acr_name                     = var.acr_name
  cpu                          = 0.25
  memory                       = "0.5Gi"
  database_url                 = var.database_url
  enable_ingress               = true
  target_port                  = 3000
  min_replicas                 = 1
  max_replicas                 = 5
  twilio_account_sid           = var.twilio_account_sid
  twilio_auth_token            = var.twilio_auth_token
  twilio_messaging_service_sid = var.twilio_messaging_service_sid
  twilio_phone_number          = var.twilio_phone_number
  env_vars = {
    RABBITMQ_HOST = var.rabbitmq_container
    REDIS_HOST    = var.redis_container
    PORT          = "3000"
  }
}

# RabbitMQ
module "rabbitmq" {
  source                       = "./modules/container_app"
  name                         = var.rabbitmq_container
  image                        = var.rabbitmq_image
  rg_name                      = var.rg_name
  container_app_env_name       = var.container_app_env_name
  acr_name                     = var.acr_name
  cpu                          = 0.5
  memory                       = "1Gi"
  enable_ingress               = true
  target_port                  = 5672
  min_replicas                 = 1
  max_replicas                 = 2
  twilio_account_sid           = var.twilio_account_sid
  twilio_auth_token            = var.twilio_auth_token
  twilio_messaging_service_sid = var.twilio_messaging_service_sid
  twilio_phone_number          = var.twilio_phone_number
}

# Redis
module "redis" {
  source                       = "./modules/container_app"
  name                         = var.redis_container
  image                        = var.redis_image
  rg_name                      = var.rg_name
  container_app_env_name       = var.container_app_env_name
  acr_name                     = var.acr_name
  cpu                          = 0.5
  memory                       = "1Gi"
  enable_ingress               = false
  target_port                  = 6379
  min_replicas                 = 1
  max_replicas                 = 2
  twilio_account_sid           = var.twilio_account_sid
  twilio_auth_token            = var.twilio_auth_token
  twilio_messaging_service_sid = var.twilio_messaging_service_sid
  twilio_phone_number          = var.twilio_phone_number
}

