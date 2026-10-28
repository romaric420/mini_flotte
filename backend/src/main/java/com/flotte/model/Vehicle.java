package com.flotte.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicle")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String plate;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(name = "manufacture_year", nullable = false)
    private Integer manufactureYear;

    @Column(name = "fuel_type", nullable = false, length = 20)
    private String fuelType;

    @Column(nullable = false)
    private Integer mileage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VehicleStatus status;

    /** Conducteur actuel (null = véhicule non attribué). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private AppUser driver;

    protected Vehicle() {
    }

    public Vehicle(String plate, String brand, String model, Integer manufactureYear,
                   String fuelType, Integer mileage) {
        this.plate = plate;
        this.brand = brand;
        this.model = model;
        this.manufactureYear = manufactureYear;
        this.fuelType = fuelType;
        this.mileage = mileage;
        this.status = VehicleStatus.AVAILABLE;
    }

    /** Attribue le véhicule à un conducteur. */
    public void assignTo(AppUser newDriver) {
        this.driver = newDriver;
        this.status = VehicleStatus.ASSIGNED;
    }

    /** Retire le conducteur et passe le véhicule dans le statut demandé. */
    public void release(VehicleStatus newStatus) {
        this.driver = null;
        this.status = newStatus;
    }

    public Long getId() { return id; }
    public String getPlate() { return plate; }
    public String getBrand() { return brand; }
    public String getModel() { return model; }
    public Integer getManufactureYear() { return manufactureYear; }
    public String getFuelType() { return fuelType; }
    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }
    public VehicleStatus getStatus() { return status; }
    public AppUser getDriver() { return driver; }
}
