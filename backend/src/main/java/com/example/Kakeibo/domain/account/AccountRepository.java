package com.example.Kakeibo.domain.account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
    List<Account> findByUserIdAndArchivedFalse(Long userId);

    @Query("SELECT a FROM Account a WHERE a.id = :id AND a.user.id = :userId")
    Optional<Account> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}
