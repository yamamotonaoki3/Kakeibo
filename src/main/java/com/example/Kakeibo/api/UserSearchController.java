package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserSearchController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(List.of());
        }
        List<Map<String, Object>> results = userRepository.searchByDisplayName(query)
                .stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("displayName", u.getDisplayName());
                    return m;
                })
                .toList();
        return ResponseEntity.ok(results);
    }
}
