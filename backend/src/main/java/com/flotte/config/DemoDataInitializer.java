package com.flotte.config;

import com.flotte.model.*;
import com.flotte.repository.AppUserRepository;
import com.flotte.repository.MaintenanceRepository;
import com.flotte.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Remplit la base avec 5 utilisateurs, 8 véhicules et quelques entretiens,
 * uniquement si la base est vide et si app.seed-demo-data=true.
 * Les mots de passe sont hachés en BCrypt au moment de l'insertion.
 */
@Component
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true")
public class DemoDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final AppUserRepository users;
    private final VehicleRepository vehicles;
    private final MaintenanceRepository maintenances;
    private final PasswordEncoder encoder;

    public DemoDataInitializer(AppUserRepository users, VehicleRepository vehicles,
                               MaintenanceRepository maintenances, PasswordEncoder encoder) {
        this.users = users;
        this.vehicles = vehicles;
        this.maintenances = maintenances;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) {
            log.info("Données déjà présentes : pas d'initialisation.");
            return;
        }

        // --- 5 utilisateurs (id 1 à 5 sur une base neuve) ---
        var sophie = users.save(user("admin", "Sophie Martin", "sophie.martin@flotte.local", "Admin2026!", Role.ADMIN));
        var julien = users.save(user("jdupont", "Julien Dupont", "julien.dupont@flotte.local", "Julien2026!", Role.DRIVER));
        var amina = users.save(user("aleroy", "Amina Leroy", "amina.leroy@flotte.local", "Amina2026!", Role.DRIVER));
        var kofi = users.save(user("kmensah", "Kofi Mensah", "kofi.mensah@flotte.local", "Kofi2026!", Role.DRIVER));
        var lucie = users.save(user("lbernard", "Lucie Bernard", "lucie.bernard@flotte.local", "Lucie2026!", Role.DRIVER));

        // --- 8 véhicules ---
        var clio = new Vehicle("AB-123-CD", "Renault", "Clio V", 2021, "Essence", 45200);
        clio.assignTo(julien);
        var p308 = new Vehicle("EF-456-GH", "Peugeot", "308", 2022, "Diesel", 38900);
        p308.assignTo(amina);
        var kangoo = new Vehicle("IJ-789-KL", "Renault", "Kangoo Van", 2020, "Diesel", 92300);
        kangoo.assignTo(kofi);
        var tesla = new Vehicle("MN-012-OP", "Tesla", "Model 3", 2023, "Électrique", 21000);
        tesla.assignTo(lucie);
        var c3 = new Vehicle("QR-345-ST", "Citroën", "C3", 2019, "Essence", 67500);
        c3.assignTo(julien);
        var yaris = new Vehicle("UV-678-WX", "Toyota", "Yaris Hybride", 2022, "Hybride", 18700);
        var transit = new Vehicle("YZ-901-AB", "Ford", "Transit", 2018, "Diesel", 145000);
        transit.release(VehicleStatus.MAINTENANCE);
        var sandero = new Vehicle("CD-234-EF", "Dacia", "Sandero", 2021, "Essence", 52100);

        vehicles.save(clio);
        vehicles.save(p308);
        vehicles.save(kangoo);
        vehicles.save(tesla);
        vehicles.save(c3);
        vehicles.save(yaris);
        vehicles.save(transit);
        vehicles.save(sandero);

        // --- Quelques entretiens ---
        maintenances.save(new Maintenance(clio, LocalDate.of(2026, 3, 12), "Révision", "Vidange + filtres", new BigDecimal("189.90"), 40000));
        maintenances.save(new Maintenance(kangoo, LocalDate.of(2026, 5, 4), "Pneus", "4 pneus neufs", new BigDecimal("420.00"), 88000));
        maintenances.save(new Maintenance(transit, LocalDate.of(2026, 10, 20), "Réparation", "Embrayage à remplacer", new BigDecimal("1250.00"), 145000));
        maintenances.save(new Maintenance(tesla, LocalDate.of(2026, 6, 18), "Contrôle", "Contrôle annuel", new BigDecimal("95.00"), 18000));

        log.info("Données de démo créées : 5 utilisateurs, 8 véhicules, 4 entretiens.");
    }

    private AppUser user(String username, String fullName, String email, String rawPassword, Role role) {
        return new AppUser(username, fullName, email, encoder.encode(rawPassword), role);
    }
}
