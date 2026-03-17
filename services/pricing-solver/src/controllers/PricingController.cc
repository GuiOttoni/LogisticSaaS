#include "PricingController.h"
#include <drogon/HttpAppFramework.h>
#include <drogon/HttpResponse.h>
#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Result.h>
#include <functional>
#include <iostream>
#include <jsoncpp/json/json.h>
#include <string>
#include <vector>

using namespace drogon;
using namespace drogon::orm;

namespace api {
namespace v1 {

void PricingController::calculate(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback) {
  auto body = req->getJsonObject();
  if (!body) {
    auto resp = HttpResponse::newHttpResponse();
    resp->setStatusCode(k400BadRequest);
    callback(resp);
    return;
  }

  std::string sku      = body->isMember("sku")        ? (*body)["sku"].asString()        : "unknown";
  std::string category = body->isMember("category")   ? (*body)["category"].asString()   : "";
  double basePrice     = body->isMember("base_price")  ? (*body)["base_price"].asDouble()  : 0.0;
  // stock_level accepted for future conditional logic (0.0–1.0 ratio)
  double stockLevel    = body->isMember("stock_level") ? (*body)["stock_level"].asDouble() : 1.0;

  auto dbClient = app().getDbClient();
  // Fetch applicable rules: GLOBAL always applies; SKU matches exact sku;
  // CATEGORY matches the category param. Ordered by priority DESC so index 0 is highest.
  dbClient->execSqlAsync(
      "SELECT id, name, weight, multiplier, base_markup FROM "
      "pricing.pricing_rules "
      "WHERE is_active = true "
      "  AND (target_scope = 'GLOBAL' "
      "       OR (target_scope = 'SKU'      AND target_id = $1) "
      "       OR (target_scope = 'CATEGORY' AND target_id = $2)) "
      "ORDER BY priority DESC "
      "LIMIT 1",
      [callback, basePrice, stockLevel, sku](const Result &r) {
        double finalPrice = basePrice;
        std::string appliedRule = "none";
        std::string ruleId = "";

        if (r.size() > 0) {
          auto const &row = r[0];
          double multiplier = row["multiplier"].as<double>();
          double markup     = row["base_markup"].as<double>();
          double weight     = row["weight"].as<double>();
          appliedRule = row["name"].as<std::string>();
          ruleId      = row["id"].as<std::string>();

          // Formula: (basePrice + markup) * multiplier, blended by weight
          double ruleEffect = (basePrice + markup) * multiplier;
          finalPrice = (basePrice * (1.0 - weight)) + (ruleEffect * weight);
        }

        Json::Value ret;
        ret["sku"]             = sku;
        ret["base_price"]      = basePrice;
        ret["calculated_price"] = finalPrice;
        ret["rule"]            = appliedRule;
        ret["ruleId"]          = ruleId;

        auto resp = HttpResponse::newHttpJsonResponse(ret);
        callback(resp);
      },
      [callback](const DrogonDbException &e) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        resp->setBody(e.base().what());
        callback(resp);
      },
      sku, category);
}

void PricingController::health(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback) {
  auto resp = HttpResponse::newHttpResponse();
  resp->setBody("OK");
  callback(resp);
}

} // namespace v1
} // namespace api
