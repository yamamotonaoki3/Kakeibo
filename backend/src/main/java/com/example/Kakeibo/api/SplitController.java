package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.split.SplitService;
import com.example.Kakeibo.domain.split.SplitService.ShareRequest;
import com.example.Kakeibo.domain.split.SplitShare;
import com.example.Kakeibo.domain.split.SplitTransaction;
import com.example.Kakeibo.domain.user.User;
import com.example.Kakeibo.domain.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/splits")
@RequiredArgsConstructor
public class SplitController {

    private final SplitService splitService;
    private final UserService userService;

    record ShareReq(@NotNull Long userId, @NotNull BigDecimal shareRatio) {}

    record CreateSplitRequest(
            @NotNull Long groupId,
            @NotNull Long totalAmount,
            String memo,
            @NotNull LocalDate splitDate,
            @NotEmpty List<ShareReq> shares
    ) {}

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateSplitRequest req, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        List<ShareRequest> shareRequests = req.shares().stream()
                .map(s -> new ShareRequest(s.userId(), s.shareRatio()))
                .toList();
        SplitTransaction tx = splitService.createSplit(
                user, req.groupId(), req.totalAmount(), req.memo(), req.splitDate(), shareRequests);
        return ResponseEntity.ok(toMap(tx, splitService.getShares(tx.getId())));
    }

    @GetMapping
    public List<Map<String, Object>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return splitService.listSplits(user, from, to).stream()
                .map(tx -> toMap(tx, splitService.getShares(tx.getId())))
                .toList();
    }

    @PatchMapping("/{splitId}/shares/{shareId}/settle")
    public ResponseEntity<?> settle(@PathVariable Long splitId, @PathVariable Long shareId, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        splitService.settleShare(user, shareId);
        return ResponseEntity.ok(Map.of("message", "精算完了しました"));
    }

    @GetMapping("/summary")
    public List<Map<String, Object>> summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return splitService.getSummary(user, from, to).stream()
                .map(d -> Map.of(
                        "fromUserId", (Object) d.fromUserId(),
                        "fromDisplayName", d.fromDisplayName(),
                        "toUserId", d.toUserId(),
                        "toDisplayName", d.toDisplayName(),
                        "amount", d.amount()
                )).toList();
    }

    private Map<String, Object> toMap(SplitTransaction tx, List<SplitShare> shares) {
        return Map.of(
                "id", (Object) tx.getId(),
                "groupId", tx.getGroup().getId(),
                "groupName", tx.getGroup().getName(),
                "totalAmount", tx.getTotalAmount(),
                "paidByUserId", tx.getPaidBy().getId(),
                "paidByDisplayName", tx.getPaidBy().getDisplayName(),
                "memo", tx.getMemo() != null ? tx.getMemo() : "",
                "splitDate", tx.getSplitDate().toString(),
                "createdAt", tx.getCreatedAt().toString(),
                "shares", shares.stream().map(s -> Map.of(
                        "id", (Object) s.getId(),
                        "userId", s.getUser().getId(),
                        "displayName", s.getUser().getDisplayName(),
                        "shareRatio", s.getShareRatio(),
                        "shareAmount", s.getShareAmount(),
                        "isSettled", s.getIsSettled(),
                        "settledAt", s.getSettledAt() != null ? s.getSettledAt().toString() : ""
                )).toList()
        );
    }
}
