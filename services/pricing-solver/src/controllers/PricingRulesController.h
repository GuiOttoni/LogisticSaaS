#pragma once
#include <drogon/HttpController.h>
#include <string>

namespace api {
namespace v1 {

class PricingRulesController
    : public drogon::HttpController<PricingRulesController> {
public:
  METHOD_LIST_BEGIN
  ADD_METHOD_TO(PricingRulesController::getRules, "/pricing-rules",
                drogon::Get);
  ADD_METHOD_TO(PricingRulesController::createRule, "/pricing-rules",
                drogon::Post);
  ADD_METHOD_TO(PricingRulesController::updateRule, "/pricing-rules/{id}",
                drogon::Put);
  ADD_METHOD_TO(PricingRulesController::deleteRule, "/pricing-rules/{id}",
                drogon::Delete);
  METHOD_LIST_END

  void
  getRules(const drogon::HttpRequestPtr &req,
           std::function<void(const drogon::HttpResponsePtr &)> &&callback);
  void
  createRule(const drogon::HttpRequestPtr &req,
             std::function<void(const drogon::HttpResponsePtr &)> &&callback);
  void
  updateRule(const drogon::HttpRequestPtr &req,
             std::function<void(const drogon::HttpResponsePtr &)> &&callback,
             std::string &&id);
  void
  deleteRule(const drogon::HttpRequestPtr &req,
             std::function<void(const drogon::HttpResponsePtr &)> &&callback,
             std::string &&id);
};

} // namespace v1
} // namespace api
