package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.group.ExpenseGroup;
import com.example.Kakeibo.domain.group.GroupMember;
import com.example.Kakeibo.domain.group.GroupService;
import com.example.Kakeibo.domain.user.User;
import com.example.Kakeibo.domain.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final UserService userService;

    record CreateGroupRequest(@NotBlank @Size(max = 100) String name) {}
    record JoinGroupRequest(@NotBlank String inviteCode) {}

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateGroupRequest req, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        ExpenseGroup group = groupService.createGroup(user, req.name());
        return ResponseEntity.ok(toMap(group));
    }

    @GetMapping
    public List<Map<String, Object>> list(Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return groupService.getMyGroups(user).stream().map(this::toMap).toList();
    }

    @PostMapping("/join")
    public ResponseEntity<?> join(@Valid @RequestBody JoinGroupRequest req, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        ExpenseGroup group = groupService.joinGroup(user, req.inviteCode());
        return ResponseEntity.ok(toMap(group));
    }

    @GetMapping("/{id}/members")
    public List<Map<String, Object>> members(@PathVariable Long id, Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return groupService.getMembers(id, user).stream()
                .map(this::toMemberMap)
                .toList();
    }

    private Map<String, Object> toMap(ExpenseGroup g) {
        return Map.of(
                "id", (Object) g.getId(),
                "name", g.getName(),
                "inviteCode", g.getInviteCode(),
                "createdByDisplayName", g.getCreatedBy().getDisplayName(),
                "createdAt", g.getCreatedAt().toString()
        );
    }

    private Map<String, Object> toMemberMap(GroupMember m) {
        return Map.of(
                "userId", (Object) m.getUser().getId(),
                "displayName", m.getUser().getDisplayName(),
                "joinedAt", m.getJoinedAt().toString()
        );
    }
}
