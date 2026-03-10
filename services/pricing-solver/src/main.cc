#include <drogon/drogon.h>

int main() {
    drogon::app()
        .setLogPath("./")
        .setLogLevel(trantor::Logger::kInfo)
        .addListener("0.0.0.0", 3003)
        .setThreadNum(4)
        .run();
    return 0;
}
