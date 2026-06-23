package com.example.Kakeibo.domain.group;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<ExpenseGroup, Long> {

    Optional<ExpenseGroup> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);

    @Query("SELECT gm.group FROM GroupMember gm WHERE gm.user.id = :userId")
    List<ExpenseGroup> findGroupsByUserId(@Param("userId") Long userId);

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.group.id = :groupId")
    List<GroupMember> findMembersByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId")
    boolean isMember(@Param("groupId") Long groupId, @Param("userId") Long userId);
}
