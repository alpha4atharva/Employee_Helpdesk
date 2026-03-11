# Variables
variable "subscription_id" {
  type        = string
  description = "Azure Subscription ID"
}
variable "resource_group_name" {
  type        = string
  default     = "ehd-rg"
  description = "Name of the resource group"
}

variable "location" {
  type        = string
  default     = "East Asia"
  description = "Azure region"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Environment name"
}

variable "vnet_name" {
  type        = string
  default     = "ehd-vnet"
  description = "Name of the virtual network"
}

variable "vnet_address_space" {
  type        = list(string)
  default     = ["10.0.0.0/16"]
  description = "Address space for the VNet"
}

variable "subnet_name" {
  type        = string
  default     = "ehd-subnet"
  description = "Name of the subnet"
}

variable "subnet_address_prefix" {
  type        = list(string)
  default     = ["10.0.1.0/24"]
  description = "Address prefix for the subnet"
}

variable "vm_name" {
  type        = string
  default     = "ehd-vm"
  description = "Name of the virtual machine"
}

variable "vm_size" {
  type        = string
  default     = "Standard_B2s_v2"
  description = "Size of the VM"
}

variable "admin_username" {
  type        = string
  default     = "azureuser"
  description = "Admin username for the VM"
}

variable "key_vault_name" {
  type        = string
  default     = "ehdvault123"
  description = "Name of the Key Vault"
}

# Generate random suffix for unique names
resource "random_integer" "suffix" {
  min = 1000
  max = 9999
}

# Generate SSH key pair
resource "tls_private_key" "main" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Save private key locally
resource "local_file" "private_key" {
  filename          = "${path.module}/ehd_vm_key.pem"
  content           = tls_private_key.main.private_key_pem
  file_permission   = "0600"
  directory_permission = "0700"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    environment = var.environment
    project     = "ehd"
  }
}

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "ehd${random_integer.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  admin_enabled       = true
  sku                 = "Standard"

  tags = {
    environment = var.environment
  }
}

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = var.vnet_name
  address_space       = var.vnet_address_space
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    environment = var.environment
  }
}

# Subnet
resource "azurerm_subnet" "main" {
  name                 = var.subnet_name
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = var.subnet_address_prefix
}

# Network Security Group
resource "azurerm_network_security_group" "main" {
  name                = "${var.vm_name}-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "HTTP"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "HTTPS"
    priority                   = 1003
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Frontend"
    priority                   = 1004
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5173"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = {
    environment = var.environment
  }
}

# Network Interface
resource "azurerm_network_interface" "main" {
  name                = "${var.vm_name}-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "testConfiguration"
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.main.id
  }

  tags = {
    environment = var.environment
  }
}

# Associate NSG with Subnet
resource "azurerm_subnet_network_security_group_association" "main" {
  subnet_id                 = azurerm_subnet.main.id
  network_security_group_id = azurerm_network_security_group.main.id
}

# Public IP
resource "azurerm_public_ip" "main" {
  name                = "${var.vm_name}-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = {
    environment = var.environment
  }
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                       = "ehdvault${random_integer.suffix.result}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  enabled_for_disk_encryption = true
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get", "Create", "Delete", "List", "Restore", "Recover", "UnwrapKey", "WrapKey", "Purge", "Encrypt", "Decrypt", "Sign", "Verify"
    ]

    secret_permissions = [
      "Get", "Set", "Delete", "List", "Restore", "Recover", "Purge"
    ]
  }

  tags = {
    environment = var.environment
  }
}

# Get current Azure context
data "azurerm_client_config" "current" {}

# Storage Account for VM diagnostics
resource "azurerm_storage_account" "main" {
  name                     = "ehddiag${random_integer.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    environment = var.environment
  }
}

# Virtual Machine
resource "azurerm_linux_virtual_machine" "main" {
  name                = var.vm_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  size                = var.vm_size

  admin_username = var.admin_username

  # Disable password authentication and use SSH keys instead
  disable_password_authentication = true

  admin_ssh_key {
    username   = var.admin_username
    public_key = tls_private_key.main.public_key_openssh
  }

  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }

  boot_diagnostics {
    storage_account_uri = azurerm_storage_account.main.primary_blob_endpoint
  }

  tags = {
    environment = var.environment
  }

  depends_on = [
    azurerm_network_interface.main,
  ]
}

# Outputs
output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Name of the created resource group"
}

output "virtual_network_id" {
  value       = azurerm_virtual_network.main.id
  description = "ID of the created Virtual Network"
}

output "subnet_id" {
  value       = azurerm_subnet.main.id
  description = "ID of the created Subnet"
}

output "key_vault_id" {
  value       = azurerm_key_vault.main.id
  description = "ID of the created Key Vault"
}

output "vm_public_ip" {
  value       = azurerm_public_ip.main.ip_address
  description = "Public IP address of the VM"
}

output "vm_private_ip" {
  value       = azurerm_network_interface.main.private_ip_address
  description = "Private IP address of the VM"
}

output "vm_id" {
  value       = azurerm_linux_virtual_machine.main.id
  description = "ID of the created VM"
}

output "private_key_path" {
  value       = local_file.private_key.filename
  description = "Path to the private SSH key file"
}

output "ssh_command" {
  value       = "ssh -i ${local_file.private_key.filename} ${var.admin_username}@${azurerm_public_ip.main.ip_address}"
  description = "SSH command to connect to the VM"
}

output "acr_login_server" {
  value       = azurerm_container_registry.main.login_server
  description = "Login server URL for the Azure Container Registry"
}

output "acr_admin_username" {
  value       = azurerm_container_registry.main.admin_username
  description = "Admin username for the Azure Container Registry"
  sensitive   = true
}

output "acr_admin_password" {
  value       = azurerm_container_registry.main.admin_password
  description = "Admin password for the Azure Container Registry"
  sensitive   = true
}

output "acr_id" {
  value       = azurerm_container_registry.main.id
  description = "ID of the created Azure Container Registry"
}
