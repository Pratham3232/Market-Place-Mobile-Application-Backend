variable "name" {}
variable "image" {}
variable "rg_name" {}
variable "container_app_env_name" {}
variable "acr_name" {}
variable "cpu" { default = 0.5 }
variable "memory" { default = "1Gi" }
variable "database_url" { default = null }
variable "enable_ingress" { default = false }
variable "target_port" { default = 3000 }
variable "env_vars" {
  type    = map(string)
  default = {}
}
variable "min_replicas" {}
variable "max_replicas" {}

variable "twilio_account_sid" {}
variable "twilio_auth_token" {}
variable "twilio_messaging_service_sid" {}
variable "twilio_phone_number" {}

variable "redis_host" {}
variable "rabbitmq_host" {}

variable "xpi_base_url" {
  
}
variable "AZURE_STORAGE_CONNECTION_STRING" {
  
}

  
provider "azurerm" {
  features {}
}

locals {
  auth_containers = ["auth", "stgauth", "devauth"]
  providers_containers = ["providers", "stgproviders", "devproviders"]
  storage_containers = ["storage", "stgstorage", "devstorage"]
  redis_containers = ["redis", "stgredis", "devredis"]
  rabbitmq_containers = ["rabbitmq", "stgrabbitmq", "devrabbitmq"]

  no_ingress_containers = concat(local.redis_containers, local.rabbitmq_containers)

  enable_ingress_for_container = (
    var.enable_ingress && !contains(local.no_ingress_containers, lower(var.name))
  )
}




data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = var.rg_name
}

data "azurerm_container_app_environment" "env" {
  name                = var.container_app_env_name
  resource_group_name = var.rg_name
}
data "azurerm_user_assigned_identity" "uami" {
  name                = "xuman-identity"
  resource_group_name = "terraform-statefiles-rg"
}
resource "azurerm_container_app" "this" {
  name                         = var.name
  resource_group_name          = var.rg_name
  container_app_environment_id = data.azurerm_container_app_environment.env.id
  revision_mode                = "Single"

  identity {
    type         = "SystemAssigned, UserAssigned"
    identity_ids = [data.azurerm_user_assigned_identity.uami.id]
  }

  registry {
    server   = data.azurerm_container_registry.acr.login_server
    identity = data.azurerm_user_assigned_identity.uami.id
  }
  secret {
    name  = "twilio-account-sid"
    value = var.twilio_account_sid
  }

  secret {
    name  = "twilio-auth-token"
    value = var.twilio_auth_token
  }
  secret {
    name  = "twilio-messaging-service-sid"
    value = var.twilio_messaging_service_sid
  }

  secret {
    name  = "twilio-phone-number"
    value = var.twilio_phone_number
  }
  secret {
    name  = "redis-url"
    value = var.redis_host
  }
  secret {
    name  = "rabbitmq-url"
    value = var.rabbitmq_host
  }
  secret {
    name  = "xpi-base-url"
    value = var.xpi_base_url
  }
  secret {
    name  = "azure-storage-connection-string"
    value = var.AZURE_STORAGE_CONNECTION_STRING
  }
  template {
    container {
      name   = var.name
      image  = "${data.azurerm_container_registry.acr.login_server}/${var.image}:latest"
      cpu    = var.cpu
      memory = var.memory

      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      # Optional DB URL
      dynamic "env" {
        for_each = var.database_url != null ? { DATABASE_URL = var.database_url } : {}
        content {
          name  = env.key
          value = env.value
        }
      }
      dynamic "env" {
        for_each = contains(local.auth_containers, var.name) ? {
          TWILIO_ACCOUNT_SID           = "twilio-account-sid"
          TWILIO_AUTH_TOKEN            = "twilio-auth-token"
          TWILIO_MESSAGING_SERVICE_SID = "twilio-messaging-service-sid"
          TWILIO_PHONE_NUMBER          = "twilio-phone-number"
          REDIS_HOST                   = "redis-url"
          RABBITMQ_HOST                = "rabbitmq-url"
        } : {}

        content {
          name        = env.key
          secret_name = env.value
        }
      }
      dynamic "env" {
        for_each = contains(local.providers_containers, var.name) ? {
          REDIS_HOST                   = "redis-url"
          RABBITMQ_HOST                = "rabbitmq-url"
        } : {}

        content {
          name        = env.key
          secret_name = env.value
        }
      }
      dynamic "env" {
        for_each = contains(local.storage_containers, var.name) ? {
          AZURE_STORAGE_CONNECTION_STRING = "azure-storage-connection-string"
          XPI_BASE_URL                   = "xpi-base-url"
        } : {}

        content {
          name        = env.key
          secret_name = env.value
        }
      }
    }
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas
  }


  
  dynamic "ingress" {
  for_each = var.enable_ingress ? { "ingress" = true } : {}

  content {
    
    external_enabled = contains(local.no_ingress_containers, lower(var.name)) ? false : true
    transport        = contains(local.no_ingress_containers, lower(var.name)) ? "tcp"  : "auto"
    target_port      = var.target_port

    
    exposed_port     = contains(local.no_ingress_containers, lower(var.name)) ? var.target_port : null

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}
}
