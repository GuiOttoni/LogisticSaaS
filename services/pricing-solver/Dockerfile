FROM ubuntu:24.04 AS builder
WORKDIR /build
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    build-essential cmake cmake-data libdrogon-dev libjsoncpp-dev \
    libssl-dev zlib1g-dev uuid-dev && rm -rf /var/lib/apt/lists/*
COPY . .
RUN cmake -B /build/cmake-out -S /build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build /build/cmake-out -j$(nproc)

FROM ubuntu:24.04 AS runner
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    libdrogon1t64 libjsoncpp25 libssl3 zlib1g uuid-runtime \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /build/cmake-out/pricing_solver .
EXPOSE 3003
CMD ["./pricing_solver"]
