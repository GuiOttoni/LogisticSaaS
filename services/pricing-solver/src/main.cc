#include "KafkaConsumerService.h"
#include <cstdlib>
#include <drogon/HttpAppFramework.h>
#include <iostream>

using namespace drogon;

int main() {
  // --- Kafka Consumer ---
  std::string kafkaBrokers = std::getenv("KAFKA_BOOTSTRAP_SERVERS")
                                 ? std::getenv("KAFKA_BOOTSTRAP_SERVERS")
                                 : "kafka:9092";
  std::string kafkaTopic = std::getenv("KAFKA_TOPIC_INVENTORY")
                               ? std::getenv("KAFKA_TOPIC_INVENTORY")
                               : "inventory-events";

  // Standardized start call with api::v1 namespace
  api::v1::KafkaConsumerService::instance().start(kafkaBrokers, kafkaTopic);

  // --- Drogon Configuration ---
  std::cout << "Loading config file..." << std::endl;
  app().loadConfigFile("/app/config.json");
  std::cout << "Config file loaded." << std::endl;

  // Start Drogon event loop
  std::cout << "Starting Drogon..." << std::endl;
  app().run();
  return 0;
}
