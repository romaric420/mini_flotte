package com.flotte.web;

import com.flotte.dto.MaintenanceDto;
import com.flotte.dto.Requests;
import com.flotte.dto.VehicleDto;
import com.flotte.service.FleetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final FleetService fleet;

    public VehicleController(FleetService fleet) {
        this.fleet = fleet;
    }

    @GetMapping
    public List<VehicleDto> list(Authentication auth) {
        return fleet.listVehicles(auth.getName());
    }

    @GetMapping("/{id}")
    public VehicleDto get(@PathVariable Long id, Authentication auth) {
        return fleet.getVehicle(id, auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleDto create(@Valid @RequestBody Requests.CreateVehicle req) {
        return fleet.createVehicle(req);
    }

    @PutMapping("/{id}/driver")
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleDto assign(@PathVariable Long id, @RequestBody Requests.Assign req) {
        return fleet.assign(id, req.driverId());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleDto status(@PathVariable Long id, @Valid @RequestBody Requests.ChangeStatus req) {
        return fleet.changeStatus(id, req.status());
    }

    @PatchMapping("/{id}/mileage")
    public VehicleDto mileage(@PathVariable Long id, @Valid @RequestBody Requests.UpdateMileage req,
                              Authentication auth) {
        return fleet.updateMileage(id, req.mileage(), auth.getName());
    }

    @GetMapping("/{id}/maintenances")
    public List<MaintenanceDto> maintenances(@PathVariable Long id, Authentication auth) {
        return fleet.listMaintenances(id, auth.getName());
    }

    @PostMapping("/{id}/maintenances")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public MaintenanceDto addMaintenance(@PathVariable Long id, @Valid @RequestBody Requests.CreateMaintenance req) {
        return fleet.addMaintenance(id, req);
    }
}
