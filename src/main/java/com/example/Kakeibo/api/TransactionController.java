package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.transaction.*;
import com.example.Kakeibo.domain.user.User;
import com.example.Kakeibo.domain.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    record TransactionRequest(
            @NotNull LocalDate date,
            @NotNull Long accountId,
            @NotNull @Min(1) Long amount,
            @NotNull Category category,
            @NotNull TransactionType type,
            String memo) {}

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) LocalDate date,
                                          @RequestParam(required = false) String category,
                                          @RequestParam(required = false) String type,
                                          @RequestParam(required = false) Long accountId,
                                          @RequestParam(required = false) String memo,
                                          Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        List<Transaction> transactions;
        if (date != null) {
            transactions = transactionService.findByUserAndDate(user, date);
        } else if (type != null || accountId != null || category != null || memo != null) {
            TransactionType typeEnum = type != null ? TransactionType.valueOf(type) : null;
            Category categoryEnum = category != null ? Category.valueOf(category) : null;
            transactions = transactionService.findByUserWithFilters(user, typeEnum, accountId, categoryEnum, memo);
        } else {
            transactions = transactionService.findByUser(user);
        }
        return transactions.stream().map(this::toMap).toList();
    }

    @GetMapping("/month")
    public List<Map<String, Object>> listByMonth(@RequestParam int year,
                                                  @RequestParam int month,
                                                  Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return transactionService.findByUserAndMonth(user, year, month)
                .stream().map(this::toMap).toList();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody TransactionRequest req, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Transaction t = transactionService.create(user, req.accountId(), req.date(),
                req.amount(), req.category(), req.type(), req.memo());
        return ResponseEntity.ok(toMap(t));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @Valid @RequestBody TransactionRequest req,
                                    Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Transaction t = transactionService.update(id, user, req.accountId(), req.date(),
                req.amount(), req.category(), req.type(), req.memo());
        return ResponseEntity.ok(toMap(t));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        transactionService.delete(id, user);
        return ResponseEntity.ok(Map.of("message", "削除しました"));
    }

    private Map<String, Object> toMap(Transaction t) {
        return Map.of(
                "id", t.getId(),
                "date", t.getDate().toString(),
                "accountId", t.getAccount().getId(),
                "accountName", t.getAccount().getName(),
                "amount", t.getAmount(),
                "category", t.getCategory().name(),
                "type", t.getType().name(),
                "memo", t.getMemo() != null ? t.getMemo() : ""
        );
    }
}
