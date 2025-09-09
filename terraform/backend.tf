terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-statefiles-rg"
    storage_account_name = "xumantfstatestorageacc"
    container_name       = "app"
    key                  = "app.terraform.tfstate"
  }
}
