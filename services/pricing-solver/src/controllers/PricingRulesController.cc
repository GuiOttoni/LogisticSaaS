#include "PricingRulesController.h"
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

// Serializes a Json::Value to a compact JSON string (for JSONB parameters)
static std::string toJsonString(const Json::Value &val) {
  Json::FastWriter fw;
  fw.omitEndingLineFeed();
  return fw.write(val);
}

// Parses a JSONB string back into a Json::Value; returns raw string on failure
static Json::Value parseJsonField(const std::string &raw) {
  Json::Value out;
  Json::Reader reader;
  if (!reader.parse(raw, out)) {
    out = raw;
  }
  return out;
}

void PricingRulesController::getRules(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback) {
  auto dbClient = app().getDbClient();
  dbClient->execSqlAsync(
      "SELECT id, name, target_scope, target_id, conditions, action_logic, "
      "priority, is_active, weight, multiplier, base_markup "
      "FROM pricing.pricing_rules ORDER BY priority DESC",
      [callback](const Result &r) {
        Json::Value list(Json::arrayValue);
        for (auto const &row : r) {
          Json::Value item;
          item["id"]           = row["id"].as<std::string>();
          item["name"]         = row["name"].as<std::string>();
          item["target_scope"] = row["target_scope"].as<std::string>();
          item["target_id"]    = row["target_id"].isNull() ? "" : row["target_id"].as<std::string>();
          item["conditions"]   = parseJsonField(row["conditions"].isNull()   ? "{}" : row["conditions"].as<std::string>());
          item["action_logic"] = parseJsonField(row["action_logic"].isNull() ? "{}" : row["action_logic"].as<std::string>());
          item["priority"]     = row["priority"].as<int>();
          item["is_active"]    = row["is_active"].as<bool>();
          item["weight"]       = row["weight"].as<double>();
          item["multiplier"]   = row["multiplier"].as<double>();
          item["base_markup"]  = row["base_markup"].as<double>();
          list.append(item);
        }
        callback(HttpResponse::newHttpJsonResponse(list));
      },
      [callback](const DrogonDbException &e) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        resp->setBody(std::string("DB Error: ") + e.base().what());
        callback(resp);
      });
}

void PricingRulesController::createRule(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback) {
  auto dbClient = app().getDbClient();
  auto json = req->getJsonObject();
  if (!json) {
    auto resp = HttpResponse::newHttpResponse();
    resp->setStatusCode(k400BadRequest);
    resp->setBody("Invalid JSON body");
    callback(resp);
    return;
  }

  std::string name        = json->isMember("name")         ? (*json)["name"].asString()        : "";
  std::string targetScope = json->isMember("target_scope") ? (*json)["target_scope"].asString() : "GLOBAL";
  std::string targetId    = json->isMember("target_id")    ? (*json)["target_id"].asString()    : "";
  std::string conditions  = toJsonString(json->isMember("conditions")   ? (*json)["conditions"]   : Json::Value(Json::objectValue));
  std::string actionLogic = toJsonString(json->isMember("action_logic") ? (*json)["action_logic"] : Json::Value(Json::objectValue));
  int    priority   = json->isMember("priority")    ? (*json)["priority"].asInt()    : 0;
  bool   isActive   = json->isMember("is_active")   ? (*json)["is_active"].asBool()  : true;
  double weight     = json->isMember("weight")      ? (*json)["weight"].asDouble()    : 1.0;
  double multiplier = json->isMember("multiplier")  ? (*json)["multiplier"].asDouble(): 1.0;
  double baseMarkup = json->isMember("base_markup") ? (*json)["base_markup"].asDouble(): 0.0;

  dbClient->execSqlAsync(
      "INSERT INTO pricing.pricing_rules "
      "(name, target_scope, target_id, conditions, action_logic, priority, is_active, weight, multiplier, base_markup) "
      "VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10) RETURNING id",
      [callback](const Result &r) {
        Json::Value ret;
        if (r.size() > 0) {
          ret["id"] = r[0]["id"].as<std::string>();
        }
        auto resp = HttpResponse::newHttpJsonResponse(ret);
        resp->setStatusCode(k201Created);
        callback(resp);
      },
      [callback](const DrogonDbException &e) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        resp->setBody(e.base().what());
        callback(resp);
      },
      name, targetScope, targetId, conditions, actionLogic,
      priority, isActive, weight, multiplier, baseMarkup);
}

void PricingRulesController::updateRule(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback, std::string &&id) {
  auto dbClient = app().getDbClient();
  auto json = req->getJsonObject();
  if (!json) {
    auto resp = HttpResponse::newHttpResponse();
    resp->setStatusCode(k400BadRequest);
    resp->setBody("Invalid JSON body");
    callback(resp);
    return;
  }

  std::string name      = json->isMember("name")         ? (*json)["name"].asString()         : "";
  int    priority       = json->isMember("priority")     ? (*json)["priority"].asInt()         : 0;
  bool   isActive       = json->isMember("is_active")    ? (*json)["is_active"].asBool()       : true;
  double weight         = json->isMember("weight")       ? (*json)["weight"].asDouble()        : 1.0;
  double multiplier     = json->isMember("multiplier")   ? (*json)["multiplier"].asDouble()    : 1.0;
  double baseMarkup     = json->isMember("base_markup")  ? (*json)["base_markup"].asDouble()   : 0.0;

  dbClient->execSqlAsync(
      "UPDATE pricing.pricing_rules "
      "SET name        = CASE WHEN $1 != '' THEN $1 ELSE name END, "
      "    priority    = CASE WHEN $2 != 0  THEN $2 ELSE priority END, "
      "    is_active   = $3, "
      "    weight      = $4, "
      "    multiplier  = $5, "
      "    base_markup = $6 "
      "WHERE id = $7",
      [callback](const Result &r) {
        Json::Value ret;
        ret["status"] = "updated";
        callback(HttpResponse::newHttpJsonResponse(ret));
      },
      [callback](const DrogonDbException &e) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        resp->setBody(e.base().what());
        callback(resp);
      },
      name, priority, isActive, weight, multiplier, baseMarkup, id);
}

void PricingRulesController::deleteRule(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback, std::string &&id) {
  auto dbClient = app().getDbClient();
  dbClient->execSqlAsync(
      "DELETE FROM pricing.pricing_rules WHERE id = $1",
      [callback](const Result &r) {
        Json::Value ret;
        ret["status"] = "deleted";
        callback(HttpResponse::newHttpJsonResponse(ret));
      },
      [callback](const DrogonDbException &e) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        resp->setBody(e.base().what());
        callback(resp);
      },
      id);
}

} // namespace v1
} // namespace api
