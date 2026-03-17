#include "KafkaConsumerService.h"
#include <chrono>
#include <iostream>
#include <jsoncpp/json/json.h>


namespace api {
namespace v1 {

KafkaConsumerService &KafkaConsumerService::instance() {
  static KafkaConsumerService inst;
  return inst;
}

void KafkaConsumerService::start(const std::string &brokers,
                                 const std::string &topic) {
  if (running_)
    return;

  brokers_ = brokers;
  topic_ = topic;
  running_ = true;

  std::string errstr;
  RdKafka::Conf *conf = RdKafka::Conf::create(RdKafka::Conf::CONF_GLOBAL);
  conf->set("bootstrap.servers", brokers_, errstr);
  conf->set("group.id", "pricing-solver-group", errstr);
  conf->set("auto.offset.reset", "latest", errstr);

  consumer_.reset(RdKafka::KafkaConsumer::create(conf, errstr));
  delete conf;

  if (!consumer_) {
    std::cerr << "Failed to create Kafka consumer: " << errstr << std::endl;
    running_ = false;
    return;
  }

  RdKafka::ErrorCode err = consumer_->subscribe({topic_});
  if (err != RdKafka::ERR_NO_ERROR) {
    std::cerr << "Failed to subscribe to " << topic_ << ": "
              << RdKafka::err2str(err) << std::endl;
    running_ = false;
    return;
  }

  worker_ = std::thread(&KafkaConsumerService::run, this);
}

void KafkaConsumerService::stop() {
  running_ = false;
  if (worker_.joinable()) {
    worker_.join();
  }
  if (consumer_) {
    consumer_->close();
  }
}

KafkaConsumerService::~KafkaConsumerService() { stop(); }

void KafkaConsumerService::run() {
  while (running_) {
    std::unique_ptr<RdKafka::Message> msg(consumer_->consume(100));

    if (msg->err() == RdKafka::ERR_NO_ERROR) {
      const char *payload = static_cast<const char *>(msg->payload());
      size_t      len     = msg->len();

      Json::Value event;
      Json::Reader reader;
      std::string  raw(payload, len);

      if (reader.parse(raw, event)) {
        std::string skuId      = event.isMember("skuId")         ? event["skuId"].asString()         : "unknown";
        std::string eventType  = event.isMember("eventType")     ? event["eventType"].asString()      : "unknown";
        double      qtyDelta   = event.isMember("quantityDelta") ? event["quantityDelta"].asDouble()  : 0.0;
        std::string warehouseId= event.isMember("warehouseId")   ? event["warehouseId"].asString()    : "unknown";

        std::cout << "[pricing-kafka] sku=" << skuId
                  << " event=" << eventType
                  << " qty_delta=" << qtyDelta
                  << " warehouse=" << warehouseId
                  << std::endl;

        // TODO: invalidate Redis price cache for this SKU when Redis is integrated
        // redis_->del("price:" + skuId);
      } else {
        std::cerr << "[pricing-kafka] Failed to parse JSON payload: " << raw << std::endl;
      }

    } else if (msg->err() == RdKafka::ERR__PARTITION_EOF) {
      // End of partition — not an error, just caught up
    } else if (msg->err() != RdKafka::ERR__TIMED_OUT) {
      std::cerr << "[pricing-kafka] Consumer error: "
                << RdKafka::err2str(msg->err()) << std::endl;
    }
  }
}

} // namespace v1
} // namespace api
