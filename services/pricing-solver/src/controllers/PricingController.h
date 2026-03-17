#pragma once
#include <drogon/HttpController.h>

namespace api {
namespace v1 {

class PricingController : public drogon::HttpController<PricingController> {
public:
  METHOD_LIST_BEGIN
  ADD_METHOD_TO(PricingController::calculate, "/calculate", drogon::Post);
  ADD_METHOD_TO(PricingController::health, "/health", drogon::Get);
  METHOD_LIST_END

  void
  calculate(const drogon::HttpRequestPtr &req,
            std::function<void(const drogon::HttpResponsePtr &)> &&callback);
  void health(const drogon::HttpRequestPtr &req,
              std::function<void(const drogon::HttpResponsePtr &)> &&callback);
};

} // namespace v1
} // namespace api
