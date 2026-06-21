package com.example.Kakeibo.domain.group;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);
}
