resource "azurerm_linux_virtual_machine" "a11y" {
  name                = "vm-a11y"
  location            = azurerm_resource_group.a11y.location
  resource_group_name = azurerm_resource_group.a11y.name
  size                = var.vm_size
  admin_username      = var.admin_username

  network_interface_ids = [
    azurerm_network_interface.a11y.id
  ]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }

  custom_data = base64encode(templatefile("${path.module}/cloud-init.yml", {
    docker_image = var.docker_image
  }))
}
