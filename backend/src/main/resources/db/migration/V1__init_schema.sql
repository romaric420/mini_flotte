-- Schéma initial de la base "flotte"
-- Flyway exécute ce script UNE seule fois et garde la trace dans flyway_schema_history.
-- Pour faire évoluer le schéma : créer V2__xxx.sql, ne jamais modifier V1.

CREATE TABLE app_user (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(120) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL
);

CREATE TABLE vehicle (
    id               BIGSERIAL PRIMARY KEY,
    plate            VARCHAR(20) NOT NULL UNIQUE,
    brand            VARCHAR(50) NOT NULL,
    model            VARCHAR(50) NOT NULL,
    manufacture_year INTEGER     NOT NULL,
    fuel_type        VARCHAR(20) NOT NULL,
    mileage          INTEGER     NOT NULL DEFAULT 0,
    status           VARCHAR(20) NOT NULL,
    driver_id        BIGINT REFERENCES app_user (id)
);
CREATE INDEX idx_vehicle_driver ON vehicle (driver_id);

CREATE TABLE maintenance (
    id               BIGSERIAL PRIMARY KEY,
    vehicle_id       BIGINT        NOT NULL REFERENCES vehicle (id) ON DELETE CASCADE,
    maintenance_date DATE          NOT NULL,
    type             VARCHAR(50)   NOT NULL,
    description      VARCHAR(255),
    cost             NUMERIC(10, 2) NOT NULL DEFAULT 0,
    mileage          INTEGER
);
CREATE INDEX idx_maintenance_vehicle ON maintenance (vehicle_id);
