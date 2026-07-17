package com.cypherdon.core.config;

import com.cypherdon.core.model.Tenant;
import com.cypherdon.core.model.LedgerEntry;
import com.cypherdon.core.repository.TenantRepository;
import com.cypherdon.core.repository.LedgerEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    private static final UUID DEFAULT_TENANT_ID = UUID.fromString("d3b07384-d113-4956-a5db-257b4457e5e3");

    @Override
    public void run(String... args) throws Exception {
        try {
            if (!tenantRepository.existsById(DEFAULT_TENANT_ID)) {
                Tenant tenant = new Tenant();
                tenant.setId(DEFAULT_TENANT_ID);
                tenant.setCompanyName("Cypherdon Default");
                tenant.setDomain("default.cypherdon.com");
                tenantRepository.saveAndFlush(tenant);
                System.out.println("Seeded Default Tenant: " + DEFAULT_TENANT_ID);
            }
        } catch (Exception e) {
            System.out.println("Tenant seeding skipped/already done: " + e.getMessage());
        }

        try {
            Tenant defaultTenant = tenantRepository.findById(DEFAULT_TENANT_ID).orElse(null);
            if (defaultTenant != null) {
                BigDecimal balance = ledgerEntryRepository.getBalanceByTenantId(DEFAULT_TENANT_ID);
                if (balance.compareTo(BigDecimal.ZERO) == 0) {
                    LedgerEntry entry = new LedgerEntry();
                    entry.setTenant(defaultTenant);
                    entry.setAmount(new BigDecimal("100.00"));
                    entry.setDescription("Initial Platform Welcome Credits");
                    ledgerEntryRepository.saveAndFlush(entry);
                    System.out.println("Seeded Initial Credits for Default Tenant: 100.00");
                }
            }
        } catch (Exception e) {
            System.out.println("Credits seeding skipped/already done: " + e.getMessage());
        }
    }
}
