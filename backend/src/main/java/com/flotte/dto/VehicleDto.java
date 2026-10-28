package com.flotte.dto;

import com.flotte.model.Vehicle;
import com.flotte.model.VehicleStatus;

public record VehicleDto(Long id, String plate, String brand, String model, Integer manufactureYear,
                         String fuelType, Integer mileage, VehicleStatus status,
                         Long driverId, String driverName) {

    public static VehicleDto from(Vehicle v) {
        var d = v.getDriver();
        return new VehicleDto(v.getId(), v.getPlate(), v.getBrand(), v.getModel(), v.getManufactureYear(),
                v.getFuelType(), v.getMileage(), v.getStatus(),
                d == null ? null : d.getId(), d == null ? null : d.getFullName());
    }
}
