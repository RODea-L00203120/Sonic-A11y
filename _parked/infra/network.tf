resource "azurerm_virtual_network" "a11y" {
  name                = "vnet-a11y"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.a11y.location
  resource_group_name = azurerm_resource_group.a11y.name
}

resource "azurerm_subnet" "a11y" {
  name                 = "subnet-a11y"
  resource_group_name  = azurerm_resource_group.a11y.name
  virtual_network_name = azurerm_virtual_network.a11y.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_public_ip" "a11y" {
  name                = "pip-a11y"
  location            = azurerm_resource_group.a11y.location
  resource_group_name = azurerm_resource_group.a11y.name
  allocation_method   = "Static"
  sku                 = "Basic"
}

resource "azurerm_network_interface" "a11y" {
  name                = "nic-a11y"
  location            = azurerm_resource_group.a11y.location
  resource_group_name = azurerm_resource_group.a11y.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.a11y.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.a11y.id
  }
}
