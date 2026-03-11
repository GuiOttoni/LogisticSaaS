FROM drogonframework/drogon:latest AS builder
WORKDIR /build
COPY . .
RUN cmake -B /build/cmake-out -S /build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build /build/cmake-out -j$(nproc)

FROM drogonframework/drogon:latest AS runner
WORKDIR /app
COPY --from=builder /build/cmake-out/pricing_solver .
EXPOSE 3003
CMD ["./pricing_solver"]
