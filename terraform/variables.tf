variable "rg_name" {}
variable "acr_name" {}
variable "container_app_env_name" {}
variable "image_name" {}
variable "image_tag" {}
variable "database_url" {
  
}

variable "twilio_account_sid" {}
variable "twilio_auth_token" {}
variable "twilio_messaging_service_sid" {}
variable "twilio_phone_number" {}


variable "auth_container" {}
variable "providers_container" {}
variable "rabbitmq_container" {}
variable "redis_container" {}

variable "auth_image" {}
variable "providers_image" {}
variable "rabbitmq_image" {}
variable "redis_image" {}

variable "redis_url" {}
variable "rabbitmq_url" {}