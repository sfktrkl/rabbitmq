### Cluster metrics

```bash
sudo rabbitmqctl cluster_status
sudo rabbitmqctl cluster_status --formatter json | jq
curl -s -uguest:guest -XGET http://localhost:15672/api/overview | jq
```

### Node metrics

```bash
sudo rabbitmqctl status
sudo rabbitmqctl report
sudo rabbitmq-diagnostics memory_breakdown
sudo rabbitmqctl status --formatter json | jq
curl -s -uguest:guest -XGET http://localhost:15672/api/nodes | jq
curl -s -uguest:guest -XGET http://localhost:15672/api/nodes/{NODENAME} | jq
curl -s -uguest:guest -XGET http://localhost:15672/api/nodes/{NODENAME}?memory=true&binary=true | jq
```

### Resources metrics

```bash
sudo rabbitmqctl list_exchanges --formatter pretty_table
curl -s -uguest:guest -XGET http://localhost:15672/api/exchanges | jq
sudo rabbitmqctl list_queues --formatter pretty_table
curl -s -uguest:guest -XGET http://localhost:15672/api/queues | jq
sudo rabbitmqctl list_vhosts --formatter pretty_table
curl -s -uguest:guest -XGET http://localhost:15672/api/vhosts | jq
sudo rabbitmqctl list_policies --formatter pretty_table
curl -s -uguest:guest -XGET http://localhost:15672/api/policies | jq
sudo rabbitmqctl list_users --formatter pretty_table
curl -s -uguest:guest -XGET http://localhost:15672/api/users | jq
```

#### To see some useful metrics

```bash
./runjava com.rabbitmq.perf.PerfTest \
--time 2000 \
--queue-pattern 'q.perf-test-%d' --queue-pattern-from 1 --queue-pattern-to 3 \
--producers 3 --rate 500 --consumers 3 \
--size 10 --queue-args x-queue-mode=lazy --flag persistent \
-h amqp://guest:guest@localhost:5672
```
