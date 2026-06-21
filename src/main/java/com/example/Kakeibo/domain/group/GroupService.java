package com.example.Kakeibo.domain.group;

import com.example.Kakeibo.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private static final String INVITE_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int INVITE_CODE_LENGTH = 8;
    private static final int MAX_RETRY = 5;

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public ExpenseGroup createGroup(User user, String name) {
        String inviteCode = generateUniqueInviteCode();

        ExpenseGroup group = new ExpenseGroup();
        group.setName(name);
        group.setInviteCode(inviteCode);
        group.setCreatedBy(user);
        group = groupRepository.save(group);

        addMember(group, user);
        return group;
    }

    @Transactional
    public ExpenseGroup joinGroup(User user, String inviteCode) {
        ExpenseGroup group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("招待コードが正しくありません"));

        if (groupMemberRepository.existsByGroupIdAndUserId(group.getId(), user.getId())) {
            throw new IllegalArgumentException("すでにこのグループに参加しています");
        }

        addMember(group, user);
        return group;
    }

    @Transactional(readOnly = true)
    public List<ExpenseGroup> getMyGroups(User user) {
        return groupRepository.findGroupsByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public List<GroupMember> getMembers(Long groupId, User requestingUser) {
        requireMembership(groupId, requestingUser.getId());
        return groupRepository.findMembersByGroupId(groupId);
    }

    public void requireMembership(Long groupId, Long userId) {
        if (!groupRepository.isMember(groupId, userId)) {
            throw new IllegalArgumentException("このグループへのアクセス権がありません");
        }
    }

    private void addMember(ExpenseGroup group, User user) {
        GroupMemberId memberId = new GroupMemberId();
        memberId.setGroupId(group.getId());
        memberId.setUserId(user.getId());

        GroupMember member = new GroupMember();
        member.setId(memberId);
        member.setGroup(group);
        member.setUser(user);
        groupMemberRepository.save(member);
    }

    private String generateUniqueInviteCode() {
        SecureRandom rng = new SecureRandom();
        for (int attempt = 0; attempt < MAX_RETRY; attempt++) {
            StringBuilder sb = new StringBuilder(INVITE_CODE_LENGTH);
            for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
                sb.append(INVITE_CODE_CHARS.charAt(rng.nextInt(INVITE_CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (!groupRepository.existsByInviteCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("招待コードの生成に失敗しました。再試行してください");
    }
}
