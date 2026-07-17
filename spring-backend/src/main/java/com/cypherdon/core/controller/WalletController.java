package com.cypherdon.core.controller;

import com.cypherdon.core.config.TenantContext;
import com.cypherdon.core.model.LedgerEntry;
import com.cypherdon.core.service.LedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    @Autowired
    private LedgerService ledgerService;

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Tenant context missing"));
        }
        BigDecimal balance = ledgerService.getBalance(tenantId);
        return ResponseEntity.ok(Map.of("tenantId", tenantId, "balance", balance));
    }

    @GetMapping("/history")
    public ResponseEntity<List<LedgerEntry>> getHistory() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(ledgerService.getTransactionHistory(tenantId));
    }

    @PostMapping("/add-credits")
    public ResponseEntity<?> addCredits(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Tenant context missing"));
        }

        Object amountObj = payload.get("amount");
        if (amountObj == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Amount field is required"));
        }

        BigDecimal amount;
        try {
            amount = new BigDecimal(amountObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid amount format"));
        }

        String description = (String) payload.getOrDefault("description", "Wallet Top-up");
        ledgerService.addCredits(tenantId, amount, description);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Credits added successfully",
                "newBalance", ledgerService.getBalance(tenantId)
        ));
    }
}
