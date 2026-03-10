cmake_minimum_required(VERSION 3.20)
project(pricing_solver CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Drogon REQUIRED)

add_executable(pricing_solver
    src/main.cc
    src/PricingController.cc
)

target_link_libraries(pricing_solver PRIVATE Drogon::Drogon)
target_include_directories(pricing_solver PRIVATE src)
