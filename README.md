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

### Configuration

Example configuration file can be found [here](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbit/docs/rabbitmq.conf.example).  
[Location](https://www.rabbitmq.com/configure.html#config-location) of rabbitmq.conf:

- **Ubuntu:** `/etc/rabbitmq/`
- **Windows:** `%APPDATA%\RabbitMQ\`

### Enable RabbitMQ Management Console

```bash
sudo rabbitmq-plugins enable rabbitmq_management
```

### Enable consistent hash exchange

```bash
sudo rabbitmq-plugins enable rabbitmq_consistent_hash_exchange
```

### Creating a cluster

```bash
sudo rabbitmqctl stop_app
sudo rabbitmqctl reset
sudo rabbitmqctl join_cluster rabbit@rabbit1
sudo rabbitmqctl start_app
```

### Breaking up a cluster

```bash
sudo rabbitmqctl stop_app
sudo rabbitmqctl reset
sudo rabbitmqctl start_app
```

### Cluster status

```bash
sudo rabbitmqctl cluster_status
```

### Enable shovel plugin

```bash
sudo rabbitmq-plugins enable rabbitmq_shovel
```

### Enable shovel management

```bash
sudo rabbitmq-plugins enable rabbitmq_shovel_management
```

### Enable federation plugin

```bash
sudo rabbitmq-plugins enable rabbitmq_federation
```

### Enable federation management

```bash
sudo rabbitmq-plugins enable rabbitmq_federation_management
```

### Access to server

```
amqp://localhost:5672
http://localhost:15672
guest guest
```

## Setting up Server and Client

### Install Node.js

```bash
sudo apt update
sudo apt install nodejs
```

### Install dependencies

```bash
npm install
```

### Start/Stop RabbitMQ service

```bash
npm run start-service
npm run stop-service
```

### Display RabbitMQ diagnostics

```bash
npm run stat-service
```

### Run the server or client

```bash
node server.js
node client.js
```

### Run the server with nodemon (optional)

```bash
npx nodemon server.js
```
