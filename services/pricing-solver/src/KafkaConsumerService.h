#pragma once
#include <atomic>
#include <librdkafka/rdkafkacpp.h>
#include <memory>
#include <string>
#include <thread>


namespace api {
namespace v1 {

class KafkaConsumerService {
public:
  static KafkaConsumerService &instance();
  void start(const std::string &brokers, const std::string &topic);
  void stop();

private:
  KafkaConsumerService() = default;
  ~KafkaConsumerService();
  void run();

  std::string brokers_;
  std::string topic_;
  std::thread worker_;
  std::atomic<bool> running_{false};
  std::unique_ptr<RdKafka::KafkaConsumer> consumer_;
};

} // namespace v1
} // namespace api
