#include "PricingController.h"
#include <drogon/HttpResponse.h>
#include <json/json.h>

void PricingController::asyncHandleHttpRequest(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback) {
  if (req->getPath() == "/health") {
    auto resp = HttpResponse::newHttpResponse();
    resp->setStatusCode(k200OK);
    resp->setContentTypeCode(CT_TEXT_PLAIN);
    resp->setBody("OmniDynamic Pricing Solver - OK");
    callback(resp);
    return;
  }

  // POST /calculate - Parse request body
  auto body = req->getJsonObject();
  if (!body) {
    auto resp =
        HttpResponse::newHttpJsonResponse(Json::Value("Invalid JSON body"));
    resp->setStatusCode(k400BadRequest);
    callback(resp);
    return;
  }

  double basePrice = (*body)["base_price"].asDouble();
  double stockLevel = (*body)["stock_level"].asDouble(); // 0.0 to 1.0
  std::string ruleId = (*body)["rule_id"].asString();

  // ─── Core pricing algorithm ───────────────────────────────────────────
  // Strategy: scarcity markup - inverse proportion to stock level
  double multiplier = 1.0;
  if (stockLevel < 0.15) {
    multiplier = 1.20; // +20% markup (low stock trigger)
  } else if (stockLevel < 0.30) {
    multiplier = 1.10; // +10% markup
  }
  double calculatedPrice = basePrice * multiplier;
  // ─────────────────────────────────────────────────────────────────────

  Json::Value result;
  result["calculated_price"] = calculatedPrice;
  result["base_price"] = basePrice;
  result["multiplier"] = multiplier;
  result["rule_id"] = ruleId;
  result["latency_ms"] = 0; // set by timing instrumentation

  auto resp = HttpResponse::newHttpJsonResponse(result);
  resp->setStatusCode(k200OK);
  callback(resp);
}
