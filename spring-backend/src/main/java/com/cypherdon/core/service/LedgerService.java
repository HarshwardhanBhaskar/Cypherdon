package com.cypherdon.core.service;

import com.cypherdon.core.model.Tenant;
import com.cypherdon.core.model.LedgerEntry;
import com.cypherdon.core.repository.TenantRepository;
import com.cypherdon.core.repository.LedgerEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class LedgerService {

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public BigDecimal getBalance(UUID tenantId) {
        return ledgerEntryRepository.getBalanceByTenantId(tenantId);
    }

    @Transactional
    public synchronized void addCredits(UUID tenantId, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount to add must be positive");
        }
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        LedgerEntry entry = new LedgerEntry();
        entry.setTenant(tenant);
        entry.setAmount(amount);
        entry.setDescription(description);
        ledgerEntryRepository.save(entry);
    }

    @Transactional
    public synchronized boolean deductCredits(UUID tenantId, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount to deduct must be positive");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        BigDecimal balance = ledgerEntryRepository.getBalanceByTenantId(tenantId);
        if (balance.compareTo(amount) < 0) {
            return false; // Insufficient credits
        }

        LedgerEntry entry = new LedgerEntry();
        entry.setTenant(tenant);
        // Negate the amount to represent debit
        entry.setAmount(amount.negate());
        entry.setDescription(description);
        ledgerEntryRepository.save(entry);
        return true;
    }

    @Transactional(readOnly = true)
    public List<LedgerEntry> getTransactionHistory(UUID tenantId) {
        return ledgerEntryRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }
}
