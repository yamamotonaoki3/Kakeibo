package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.account.Account;
import com.example.Kakeibo.domain.account.AccountService;
import com.example.Kakeibo.domain.user.User;
import com.example.Kakeibo.domain.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;

    record AccountRequest(@NotBlank String name, @NotNull Long initialBalance) {}

    @GetMapping
    public List<Map<String, Object>> list(Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return accountService.findByUser(user).stream()
                .map(a -> Map.of(
                        "id", (Object) a.getId(),
                        "name", a.getName(),
                        "initialBalance", a.getInitialBalance(),
                        "balance", accountService.calcBalance(a)
                )).toList();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody AccountRequest req, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Account account = accountService.create(user, req.name(), req.initialBalance());
        return ResponseEntity.ok(Map.of("id", account.getId(), "name", account.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody AccountRequest req, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Account account = accountService.update(id, user, req.name(), req.initialBalance());
        return ResponseEntity.ok(Map.of("id", account.getId(), "name", account.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        accountService.delete(id, user);
        return ResponseEntity.ok(Map.of("message", "削除しました"));
    }
}
