package com.cypherdon.core;

import com.cypherdon.core.model.Tenant;
import com.cypherdon.core.repository.TenantRepository;
import com.cypherdon.core.service.LedgerService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
public class LedgerConcurrencyTest {

    @Autowired
    private LedgerService ledgerService;

    @Autowired
    private TenantRepository tenantRepository;

    @Test
    public void testLedgerDeductionConcurrency() throws InterruptedException {
        // Create a unique tenant for this test
        UUID testTenantId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(testTenantId);
        tenant.setCompanyName("Concurrency Test Tenant");
        tenant.setDomain(testTenantId + ".concurrency.test");
        tenantRepository.save(tenant);

        // Add 10.00 credits
        ledgerService.addCredits(testTenantId, new BigDecimal("10.00"), "Initial Deposit");

        // We will trigger 10 parallel threads, each attempting to deduct 2.00 credits
        // Since balance is 10.00, exactly 5 threads should succeed, and 5 should fail.
        int totalThreads = 10;
        BigDecimal deductionAmount = new BigDecimal("2.00");
        ExecutorService executor = Executors.newFixedThreadPool(totalThreads);
        CountDownLatch latch = new CountDownLatch(totalThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < totalThreads; i++) {
            executor.submit(() -> {
                try {
                    boolean success = ledgerService.deductCredits(
                            testTenantId, 
                            deductionAmount, 
                            "Concurrent Vetting Deduction"
                    );
                    if (success) {
                        successCount.incrementAndGet();
                    } else {
                        failureCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    System.err.println("Deduction error: " + e.getMessage());
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        // Verify counts
        System.out.println("Success count: " + successCount.get());
        System.out.println("Failure count: " + failureCount.get());
        BigDecimal finalBalance = ledgerService.getBalance(testTenantId);
        System.out.println("Final balance: " + finalBalance);

        // Assertions
        Assertions.assertEquals(5, successCount.get(), "Exactly 5 deductions should succeed");
        Assertions.assertEquals(5, failureCount.get(), "Exactly 5 deductions should fail");
        Assertions.assertEquals(0, finalBalance.compareTo(BigDecimal.ZERO), "Final balance should be exactly 0.00");
    }
}
