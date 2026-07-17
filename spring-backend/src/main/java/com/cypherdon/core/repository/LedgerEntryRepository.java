package com.cypherdon.core.repository;

import com.cypherdon.core.model.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {

    List<LedgerEntry> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    @Query("SELECT COALESCE(SUM(l.amount), 0.0) FROM LedgerEntry l WHERE l.tenant.id = :tenantId")
    BigDecimal getBalanceByTenantId(@Param("tenantId") UUID tenantId);
}
