# Azure Infrastructure Deployment Guide

This Terraform configuration creates the following Azure resources:

- **Resource Group**: Container for all resources
- **Virtual Network (VNet)**: Network infrastructure
- **Subnet**: Subnetwork within the VNet
- **Network Security Group (NSG)**: Firewall rules
- **Public IP**: For accessing the VM
- **Network Interface**: VM's network adapter
- **Key Vault**: Secure credential storage
- **Storage Account**: For VM diagnostics
- **Linux Virtual Machine**: Ubuntu 20.04 LTS

## Prerequisites

1. **Azure CLI**: Install Azure CLI
   ```bash
   # Windows (via chocolatey)
   choco install azure-cli

   # Or download from: https://aka.ms/azcli
   ```

2. **Terraform**: Install Terraform
   ```bash
   # Windows (via chocolatey)
   choco install terraform

   # Or download from: https://www.terraform.io/downloads.html
   ```

3. **SSH Key Pair**: Generate SSH keys (if you don't have them)
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
   ```

## Deployment Steps

### 1. Authenticate with Azure
```bash
az login
```

### 2. Customize Configuration (Optional)
Edit `terraform.tfvars` to customize:
- Resource names
- Azure region
- VM size
- Admin username

### 3. Initialize Terraform
```bash
terraform init
```

### 4. Review the Plan
```bash
terraform plan
```

This shows what resources will be created.

### 5. Apply Configuration
```bash
terraform apply
```

Type `yes` when prompted to create the resources.

## Post-Deployment

After successful deployment, you can:

1. **Connect to the VM via SSH**:
   ```bash
   ssh azureuser@<PUBLIC_IP_ADDRESS>
   ```
   (Use the `vm_public_ip` output value)

2. **View Outputs**:
   ```bash
   terraform output
   ```

3. **View Specific Output**:
   ```bash
   terraform output vm_public_ip
   terraform output key_vault_id
   ```

## Important Notes

### SSH Key Path
The configuration expects your SSH public key at `~/.ssh/id_rsa.pub`. If your SSH key is in a different location, update this line in `main.tf`:

```terraform
public_key = file("~/.ssh/id_rsa.pub")  # Change this path
```

### Destroy Resources
To delete all created resources:
```bash
terraform destroy
```

Type `yes` when prompted.

## Architecture Overview

```
Azure Subscription
├── Resource Group (jman-rg)
│   ├── Virtual Network (10.0.0.0/16)
│   │   └── Subnet (10.0.1.0/24)
│   │       └── VM (10.0.1.x)
│   ├── Public IP (for VM access)
│   ├── Network Interface
│   ├── Network Security Group (SSH, HTTP, HTTPS)
│   ├── Key Vault (secrets management)
│   ├── Storage Account (diagnostics)
│   └── Linux VM (Ubuntu 20.04 LTS)
```

## Customization

### Change VM Size
Edit `terraform.tfvars`:
```hcl
vm_size = "Standard_B4ms"  # More powerful VM
```

### Add More Subnets
Add to `main.tf`:
```terraform
resource "azurerm_subnet" "additional" {
  name                 = "additional-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}
```

### Modify NSG Rules
Edit the `azurerm_network_security_group` block in `main.tf` to add/remove ports.

## Troubleshooting

### "Public key is not in valid format"
Ensure your SSH key is in PEM format:
```bash
ssh-keygen -p -N "" -m pem -f ~/.ssh/id_rsa
```

### Insufficient Quota
Some regions may have resource quotas. Try a different region by updating:
```hcl
location = "West US 2"
```

### State File Issues
To start fresh:
```bash
rm terraform.tfstate*
terraform init
```

## Support
For more information, see:
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Documentation](https://docs.microsoft.com/en-us/azure/)
