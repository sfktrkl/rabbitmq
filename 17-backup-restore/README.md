### Schema definition export and import

#### Export

```bash
sudo rabbitmqctl export_definitions /tmp/definitions.json
curl -s -uguest:guest -XGET http://localhost:15672/api/definitions | jq '.' > /tmp/definitions.json
```

#### Import

```bash
sudo rabbitmqctl import_definitions /tmp/definitions.json
curl -s -uguest:guest -H "Content-Type: application/json" -XPOST -T /tmp/definitions.json http://localhost:15672/api/definitions
```
