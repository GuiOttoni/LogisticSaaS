FROM drogonframework/drogon:latest AS builder
WORKDIR /build
COPY . .
RUN apt-get update && apt-get install -y librdkafka-dev libjsoncpp-dev pkg-config
RUN cmake -B /build/cmake-out -S /build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build /build/cmake-out -j$(nproc)

FROM drogonframework/drogon:latest AS runner
RUN apt-get update && apt-get install -y librdkafka1 librdkafka++1 curl gettext-base && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /build/cmake-out/pricing_solver .
COPY config.template.json /app/config.template.json
EXPOSE 3003
CMD ["sh", "-c", "envsubst < /app/config.template.json > /app/config.json && ./pricing_solver"]
