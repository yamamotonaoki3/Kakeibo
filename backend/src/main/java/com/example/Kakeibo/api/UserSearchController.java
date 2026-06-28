package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserSearchController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String username) {
        return userRepository.findByUsername(username)
                .map(u -> ResponseEntity.ok(Map.of(
                        "id", (Object) u.getId(),
                        "displayName", u.getDisplayName()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
