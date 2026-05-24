# =========================
# Stage 1 - Build
# =========================
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy the entire monorepo structure
COPY . .

WORKDIR /app/apps/api

# Build application
RUN mvn clean package -DskipTests

# =========================
# Stage 2 - Run
# =========================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy generated jar
COPY --from=builder /app/apps/api/target/*.jar app.jar

# Default values
# HuggingFace Spaces uses PORT env variable
ENV PORT=7860
ENV SPRING_PROFILES_ACTIVE=default

EXPOSE 7860

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=$PORT --spring.profiles.active=$SPRING_PROFILES_ACTIVE"]
