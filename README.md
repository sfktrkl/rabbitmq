## RabbitMQ

### Update the system

```bash
sudo apt update && sudo apt upgrade -y
```

### Add repositories

```bash
sudo apt install curl gnupg -y
curl -fsSL https://packages.rabbitmq.com/gpg | sudo apt-key add -
sudo add-apt-repository 'deb https://dl.bintray.com/rabbitmq/debian focal main'
```

### Install RabbitMQ Server

```bash
sudo apt update && sudo apt install rabbitmq-server -y --fix-missing
```

### Start/Stop RabbitMQ Server

```bash
sudo systemctl start rabbitmq-server
sudo systemctl stop rabbitmq-server
```

### Ping

```bash
sudo rabbitmq-diagnostics ping
```

### Enabled components

```bash
sudo rabbitmq-diagnostics status
```

### Access to server

```
amqp://localhost:5672
http://localhost:15672
guest guest
```
