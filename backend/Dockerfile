# ---------- Étape 1 : compilation (image lourde avec Maven + JDK) ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# On copie d'abord le pom.xml seul : tant qu'il ne change pas,
# Docker réutilise la couche en cache contenant les dépendances (build plus rapide).
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

# ---------- Étape 2 : exécution (image légère avec seulement le JRE) ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Bonne pratique : ne jamais faire tourner l'appli en root dans le conteneur
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/flotte-api.jar app.jar
USER app
EXPOSE 8080
# La JVM s'adapte à la mémoire allouée au conteneur (important sur une petite VM AWS)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"UP"' || exit 1
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
