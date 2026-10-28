package com.flotte.dto;

import com.flotte.model.Maintenance;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MaintenanceDto(Long id, LocalDate date, String type, String description,
                             BigDecimal cost, Integer mileage) {

    public static MaintenanceDto from(Maintenance m) {
        return new MaintenanceDto(m.getId(), m.getDate(), m.getType(), m.getDescription(),
                m.getCost(), m.getMileage());
    }
}
