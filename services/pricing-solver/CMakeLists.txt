cmake_minimum_required(VERSION 3.20)
project(pricing_solver CXX)

include(CheckIncludeFileCXX)

check_include_file_cxx(any HAS_ANY)
check_include_file_cxx(string_view HAS_STRING_VIEW)
check_include_file_cxx(coroutine HAS_COROUTINE)
if (NOT "${CMAKE_CXX_STANDARD}" STREQUAL "")
    # Do nothing
elseif (HAS_ANY AND HAS_STRING_VIEW AND HAS_COROUTINE)
    set(CMAKE_CXX_STANDARD 20)
elseif (HAS_ANY AND HAS_STRING_VIEW)
    set(CMAKE_CXX_STANDARD 17)
else ()
    set(CMAKE_CXX_STANDARD 14)
endif ()

set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(Drogon CONFIG REQUIRED)
find_package(PkgConfig REQUIRED)

pkg_check_modules(RDKAFKA REQUIRED rdkafka++)
pkg_check_modules(JSONCPP REQUIRED jsoncpp)

# Gather sources
aux_source_directory(src CTL_SRC)
aux_source_directory(src/controllers CTL_SRC_CONTROLLERS)
list(APPEND CTL_SRC ${CTL_SRC_CONTROLLERS})

add_executable(${PROJECT_NAME} ${CTL_SRC})

target_include_directories(${PROJECT_NAME}
    PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${RDKAFKA_INCLUDE_DIRS}
    ${JSONCPP_INCLUDE_DIRS}
)

target_link_libraries(${PROJECT_NAME}
    PRIVATE
    Drogon::Drogon
    ${RDKAFKA_LIBRARIES}
    ${JSONCPP_LIBRARIES}
)
