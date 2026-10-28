package com.flotte.repository;

import com.flotte.model.Vehicle;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /** @EntityGraph charge le conducteur dans la même requête (évite le problème N+1). */
    @EntityGraph(attributePaths = "driver")
    List<Vehicle> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = "driver")
    List<Vehicle> findByDriverUsernameOrderByIdAsc(String username);

    long countByDriverId(Long driverId);

    boolean existsByPlate(String plate);
}
