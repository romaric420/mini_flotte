package com.flotte.dto;

import com.flotte.model.Role;

/** Ce que l'API renvoie pour un utilisateur (jamais le hash du mot de passe). */
public record UserDto(Long id, String username, String fullName, String email, Role role, long vehicleCount) {
}
