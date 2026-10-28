package com.flotte.service;

import com.flotte.dto.MaintenanceDto;
import com.flotte.dto.Requests;
import com.flotte.dto.UserDto;
import com.flotte.dto.VehicleDto;
import com.flotte.model.*;
import com.flotte.repository.AppUserRepository;
import com.flotte.repository.MaintenanceRepository;
import com.flotte.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

/**
 * Toute la logique métier est ici (les contrôleurs ne font que traduire HTTP <-> Java).
 * "caller" = l'utilisateur connecté qui fait la demande.
 */
@Service
@Transactional
public class FleetService {

    private final AppUserRepository users;
    private final VehicleRepository vehicles;
    private final MaintenanceRepository maintenances;

    public FleetService(AppUserRepository users, VehicleRepository vehicles, MaintenanceRepository maintenances) {
        this.users = users;
        this.vehicles = vehicles;
        this.maintenances = maintenances;
    }

    // ---------- Utilisateurs ----------

    @Transactional(readOnly = true)
    public UserDto me(String username) {
        return toDto(findUser(username));
    }

    @Transactional(readOnly = true)
    public List<UserDto> listUsers() {
        return users.findAllByOrderByIdAsc().stream().map(this::toDto).toList();
    }

    // ---------- Véhicules ----------

    /** Le gestionnaire voit toute la flotte, un conducteur seulement ses véhicules. */
    @Transactional(readOnly = true)
    public List<VehicleDto> listVehicles(String caller) {
        var list = isAdmin(caller)
                ? vehicles.findAllByOrderByIdAsc()
                : vehicles.findByDriverUsernameOrderByIdAsc(caller);
        return list.stream().map(VehicleDto::from).toList();
    }

    @Transactional(readOnly = true)
    public VehicleDto getVehicle(Long id, String caller) {
        return VehicleDto.from(findVisibleVehicle(id, caller));
    }

    public VehicleDto createVehicle(Requests.CreateVehicle req) {
        String plate = req.plate().trim().toUpperCase(Locale.ROOT);
        if (vehicles.existsByPlate(plate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un véhicule avec l'immatriculation " + plate + " existe déjà");
        }
        var v = new Vehicle(plate, req.brand().trim(), req.model().trim(), req.manufactureYear(),
                req.fuelType().trim(), req.mileage());
        return VehicleDto.from(vehicles.save(v));
    }

    public VehicleDto assign(Long vehicleId, Long driverId) {
        var v = findVehicle(vehicleId);
        if (driverId == null) {
            if (v.getStatus() != VehicleStatus.MAINTENANCE) {
                v.release(VehicleStatus.AVAILABLE);
            }
            return VehicleDto.from(v);
        }
        if (v.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Véhicule en maintenance : impossible de l'attribuer");
        }
        var driver = users.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conducteur introuvable"));
        if (driver.getRole() != Role.DRIVER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seul un conducteur peut recevoir un véhicule");
        }
        v.assignTo(driver);
        return VehicleDto.from(v);
    }

    public VehicleDto changeStatus(Long vehicleId, VehicleStatus status) {
        var v = findVehicle(vehicleId);
        if (status == VehicleStatus.ASSIGNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Pour passer un véhicule en 'attribué', choisissez un conducteur");
        }
        v.release(status); // AVAILABLE ou MAINTENANCE : le conducteur est retiré
        return VehicleDto.from(v);
    }

    public VehicleDto updateMileage(Long vehicleId, int mileage, String caller) {
        var v = findVisibleVehicle(vehicleId, caller);
        if (mileage < v.getMileage()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le kilométrage ne peut pas baisser (actuel : " + v.getMileage() + " km)");
        }
        v.setMileage(mileage);
        return VehicleDto.from(v);
    }

    // ---------- Entretiens ----------

    @Transactional(readOnly = true)
    public List<MaintenanceDto> listMaintenances(Long vehicleId, String caller) {
        findVisibleVehicle(vehicleId, caller);
        return maintenances.findByVehicleIdOrderByDateDesc(vehicleId).stream().map(MaintenanceDto::from).toList();
    }

    public MaintenanceDto addMaintenance(Long vehicleId, Requests.CreateMaintenance req) {
        var v = findVehicle(vehicleId);
        var m = maintenances.save(new Maintenance(v, req.date(), req.type().trim(), req.description(),
                req.cost(), req.mileage()));
        if (req.mileage() != null && req.mileage() > v.getMileage()) {
            v.setMileage(req.mileage());
        }
        return MaintenanceDto.from(m);
    }

    // ---------- Outils internes ----------

    private AppUser findUser(String username) {
        return users.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    private boolean isAdmin(String username) {
        return findUser(username).getRole() == Role.ADMIN;
    }

    private Vehicle findVehicle(Long id) {
        return vehicles.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule introuvable"));
    }

    /** Un conducteur ne peut accéder qu'aux véhicules qui lui sont attribués. */
    private Vehicle findVisibleVehicle(Long id, String caller) {
        var v = findVehicle(id);
        if (isAdmin(caller)) {
            return v;
        }
        var d = v.getDriver();
        if (d == null || !d.getUsername().equals(caller)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ce véhicule ne vous est pas attribué");
        }
        return v;
    }

    private UserDto toDto(AppUser u) {
        return new UserDto(u.getId(), u.getUsername(), u.getFullName(), u.getEmail(), u.getRole(),
                vehicles.countByDriverId(u.getId()));
    }
}
