package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.split.SplitShare;
import com.example.Kakeibo.domain.split.SplitShareRepository;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;
    private final SplitShareRepository splitShareRepository;

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
        boolean hasFilter = type != null || accountId != null || category != null || memo != null;
        List<Transaction> transactions;
        if (date != null) {
            transactions = transactionService.findByUserAndDate(user, date);
        } else if (hasFilter) {
            TransactionType typeEnum = type != null ? parseType(type) : null;
            Category categoryEnum = category != null ? parseCategory(category) : null;
            transactions = transactionService.findByUserWithFilters(user, typeEnum, accountId, categoryEnum, memo);
        } else {
            transactions = transactionService.findByUser(user);
        }

        List<Map<String, Object>> result = new ArrayList<>(transactions.stream().map(this::toMap).toList());

        // カテゴリ・口座フィルターがない場合のみ割り勘を混ぜる
        if (category == null && accountId == null && type == null) {
            List<SplitShare> shares = splitShareRepository.findByUserId(user.getId(), date, date);
            for (SplitShare s : shares) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", "split-" + s.getId());
                m.put("date", s.getSplitTransaction().getSplitDate().toString());
                m.put("accountId", null);
                m.put("accountName", "");
                m.put("amount", s.getShareAmount());
                m.put("category", "OTHER_EXPENSE");
                m.put("type", "EXPENSE");
                m.put("memo", s.getSplitTransaction().getMemo() != null ? s.getSplitTransaction().getMemo() : "");
                m.put("isSplit", true);
                m.put("groupName", s.getSplitTransaction().getGroup().getName());
                m.put("paidByDisplayName", s.getSplitTransaction().getPaidBy().getDisplayName());
                result.add(m);
            }
            result.sort((a, b) -> String.valueOf(b.get("date")).compareTo(String.valueOf(a.get("date"))));
        }

        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return ResponseEntity.ok(toMap(transactionService.findById(id, user)));
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

    private TransactionType parseType(String type) {
        try {
            return TransactionType.valueOf(type);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("不正な取引種別です: " + type);
        }
    }

    private Category parseCategory(String category) {
        try {
            return Category.valueOf(category);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("不正なカテゴリです: " + category);
        }
    }
}
