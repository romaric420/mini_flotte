package com.flotte.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "maintenance_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    private Integer mileage;

    protected Maintenance() {
    }

    public Maintenance(Vehicle vehicle, LocalDate date, String type, String description,
                       BigDecimal cost, Integer mileage) {
        this.vehicle = vehicle;
        this.date = date;
        this.type = type;
        this.description = description;
        this.cost = cost;
        this.mileage = mileage;
    }

    public Long getId() { return id; }
    public Vehicle getVehicle() { return vehicle; }
    public LocalDate getDate() { return date; }
    public String getType() { return type; }
    public String getDescription() { return description; }
    public BigDecimal getCost() { return cost; }
    public Integer getMileage() { return mileage; }
}
