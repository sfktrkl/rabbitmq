### Install JDK

```bash
sudo apt install default-jdk
```

### Download RabbitMQ PerfTest

- https://rabbitmq.github.io/rabbitmq-perf-test/stable/htmlsingle/
- https://github.com/rabbitmq/rabbitmq-perf-test/releases

### Extract RabbitMQ PerfTest

```bash
tar -zxf rabbitmq-perf-test
cd rabbitmq-perf-test/bin
```

### RabbitMQ PerftTest help

```bash
./runjava com.rabbitmq.perf.PerfTest --help
```

### Test Cases

#### 1 producer, 2 consumers, 1kb message size

- Check sending and receiving rate.
- Latency is expressed as minimum, median and percentiles.

```bash
./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--producers 1 \
--consumers 2 \
--queue "q.test-1" \
--size 1000 \
--autoack \
--id "test 1" -h amqp://guest:guest@localhost:5672
```

#### Throughput vs latency

- Increasing frame size increasing the throughput but latency will be bigger.
- Second test will consume more memory and cause bigger load in the cluster.

```bash
./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--producers 1 \
--consumers 1 \
--queue "q.test-1" \
--size 1000000 \
--autoack \
--framemax 5000 \
--id "test 2" -h amqp://guest:guest@localhost:5672

./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--producers 1 \
--consumers 1 \
--queue "q.test-1" \
--size 1000000 \
--autoack \
--framemax 1000000 \
--id "test 2" -h amqp://guest:guest@localhost:5672
```

#### Custom queue attributes

- Custom attributes for priority queue and dead letter exchange.

```bash
./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--producers 1 \
--consumers 2 \
--queue "q.test-2" \
--size 1000 \
--autoack \
--queue-args x-max-length=10,x-max-priority=5,x-dead-letter-exchange=ex.dlx-exchange-name \
--auto-delete false \
--id "test 3" -h amqp://guest:guest@localhost:5672
```

#### Lazy queue

- Classic queue is slightly lower than lazy queue.
- Classic queue consumes more memory and the throughput is lower.

```bash
./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--producers 50 \
--consumers 0 \
--queue "q.lazy-queue" \
--size 1000 \
--autoack \
--flag persistent \
--queue-args x-queue-mode=lazy \
--auto-delete false \
--id "test 4" -h amqp://guest:guest@localhost:5672

./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--producers 50 \
--consumers 0 \
--queue "q.not-lazy-queue" \
--size 1000 \
--autoack \
--flag persistent \
--auto-delete false \
--id "test 4" -h amqp://guest:guest@localhost:5672
```

#### Ramp-Up test

```bash
./runjava com.rabbitmq.perf.PerfTest --help | grep start-delay

for i in {1..10}; do ./runjava com.rabbitmq.perf.PerfTest \
--time 240 \
--producers 1 \
--consumers 1 \
--queue "q.test-2" \
--size 1000 \
--autoack \
--rate 1000 \
--id "test 5" -h amqp://guest:guest@localhost:5672 & sleep 10; done
```

#### Scaling the publication process

- The general rule of finding bottlenecks is to avoid RabbitMQ flowing channel or connection.

- To understand the highest throughput for a single producer publish to exchange with a random routing key.

```bash
./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--queue "q.test-6" \
--random-routing-key \
--producers 1 \
--consumers 0 \
--size 100 \
--queue-args x-queue-mode=lazy \
--flag persistent \
-h amqp://guest:guest@localhost:5672
```

- Correctly root the messages in to single queue and scale the queue, publishers and channels.
- General conclusion is scale the producers not the channels.

```bash
./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--queue "q.test-6" \
--producers 1 \
--consumers 0 \
--size 100 \
--queue-args x-queue-mode=lazy \
--flag persistent \
-h amqp://guest:guest@localhost:5672

./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--queue-pattern 'q.perf-test-%d' --queue-pattern-from 1 --queue-pattern-to 10 \
--producers 10 \
--consumers 0 \
--size 100 \
--queue-args x-queue-mode=lazy \
--flag persistent \
-h amqp://guest:guest@localhost:5672

./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--queue-pattern 'q.perf-test-%d' --queue-pattern-from 1 --queue-pattern-to 10 \
--producers 1 \
--producer-channel-count 10 \
--consumers 0 \
--size 100 \
--queue-args x-queue-mode=lazy \
--flag persistent \
-h amqp://guest:guest@localhost:5672

./runjava com.rabbitmq.perf.PerfTest \
--time 20 \
--queue-pattern 'q.perf-test-%d' --queue-pattern-from 1 --queue-pattern-to 10 \
--producers 5 \
--producer-channel-count 2 \
--consumers 0 \
--size 100 \
--queue-args x-queue-mode=lazy \
--flag persistent \
-h amqp://guest:guest@localhost:5672
```

#### IoT

- Share sockets and threads when not used.
- NIO stands for non-blocking I/O operations.

```bash
./runjava com.rabbitmq.perf.PerfTest \
--time 120 \
--queue-pattern 'perf-test-%05d' --queue-pattern-from 1 --queue-pattern-to 2000 \
--producers 2000 --consumers 0 \
--nio-threads 10 \
--producer-scheduler-threads 10 \
--consumers-thread-pools 10 \
--publishing-interval 1 \
--size 512 \
--heartbeat-sender-threads 10 \
--flag persistent \
--producer-random-start-delay 60 \
-h amqp://guest:guest@localhost:5672
```
