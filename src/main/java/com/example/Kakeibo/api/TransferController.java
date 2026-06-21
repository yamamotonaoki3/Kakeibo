package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.transfer.Transfer;
import com.example.Kakeibo.domain.transfer.TransferService;
import com.example.Kakeibo.domain.user.User;
import com.example.Kakeibo.domain.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;
    private final UserService userService;

    record CreateTransferRequest(
            @NotNull Long toUserId,
            @NotNull Long amount,
            String memo,
            @NotNull LocalDate transferDate
    ) {}

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateTransferRequest req, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Transfer transfer = transferService.createTransfer(
                user, req.toUserId(), req.amount(), req.memo(), req.transferDate());
        return ResponseEntity.ok(toMap(transfer));
    }

    @GetMapping
    public List<Map<String, Object>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return transferService.listTransfers(user, from, to).stream().map(this::toMap).toList();
    }

    @PatchMapping("/{id}/settle")
    public ResponseEntity<?> settle(@PathVariable Long id, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        transferService.settleTransfer(user, id);
        return ResponseEntity.ok(Map.of("message", "精算完了しました"));
    }

    @GetMapping("/summary")
    public List<Map<String, Object>> summary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return transferService.getSummary(user, from, to).stream()
                .map(d -> Map.of(
                        "fromUserId", (Object) d.fromUserId(),
                        "fromDisplayName", d.fromDisplayName(),
                        "toUserId", d.toUserId(),
                        "toDisplayName", d.toDisplayName(),
                        "amount", d.amount()
                )).toList();
    }

    private Map<String, Object> toMap(Transfer t) {
        return Map.of(
                "id", (Object) t.getId(),
                "fromUserId", t.getFromUser().getId(),
                "fromDisplayName", t.getFromUser().getDisplayName(),
                "toUserId", t.getToUser().getId(),
                "toDisplayName", t.getToUser().getDisplayName(),
                "amount", t.getAmount(),
                "memo", t.getMemo() != null ? t.getMemo() : "",
                "transferDate", t.getTransferDate().toString(),
                "isSettled", t.getIsSettled(),
                "settledAt", t.getSettledAt() != null ? t.getSettledAt().toString() : ""
        );
    }
}
