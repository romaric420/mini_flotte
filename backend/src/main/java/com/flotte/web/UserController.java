package com.flotte.web;

import com.flotte.dto.UserDto;
import com.flotte.service.FleetService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    private final FleetService fleet;

    public UserController(FleetService fleet) {
        this.fleet = fleet;
    }

    /** Qui suis-je ? Sert aussi au front pour vérifier identifiant/mot de passe. */
    @GetMapping("/me")
    public UserDto me(Authentication auth) {
        return fleet.me(auth.getName());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> users() {
        return fleet.listUsers();
    }
}
