package com.flotte.dto;

import com.flotte.model.VehicleStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Corps des requêtes POST/PUT/PATCH, avec leurs règles de validation. */
public final class Requests {

    private Requests() {
    }

    public record CreateVehicle(
            @NotBlank @Size(max = 20) String plate,
            @NotBlank @Size(max = 50) String brand,
            @NotBlank @Size(max = 50) String model,
            @NotNull @Min(1990) @Max(2100) Integer manufactureYear,
            @NotBlank @Size(max = 20) String fuelType,
            @NotNull @PositiveOrZero Integer mileage) {
    }

    /** driverId = null pour retirer le conducteur. */
    public record Assign(Long driverId) {
    }

    public record ChangeStatus(@NotNull VehicleStatus status) {
    }

    public record UpdateMileage(@NotNull @PositiveOrZero Integer mileage) {
    }

    public record CreateMaintenance(
            @NotNull LocalDate date,
            @NotBlank @Size(max = 50) String type,
            @Size(max = 255) String description,
            @NotNull @PositiveOrZero BigDecimal cost,
            @PositiveOrZero Integer mileage) {
    }
}
