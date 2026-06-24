package com.example.Kakeibo.domain.transfer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransferRepository extends JpaRepository<Transfer, Long> {

    @Query("SELECT t FROM Transfer t " +
           "JOIN FETCH t.fromUser " +
           "JOIN FETCH t.toUser " +
           "WHERE (t.fromUser.id = :userId OR t.toUser.id = :userId) " +
           "AND t.transferDate BETWEEN :from AND :to " +
           "ORDER BY t.transferDate DESC, t.createdAt DESC")
    List<Transfer> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT t FROM Transfer t " +
           "JOIN FETCH t.fromUser " +
           "JOIN FETCH t.toUser " +
           "WHERE t.id = :id AND (t.fromUser.id = :userId OR t.toUser.id = :userId)")
    Optional<Transfer> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT t FROM Transfer t " +
           "JOIN FETCH t.fromUser " +
           "JOIN FETCH t.toUser " +
           "WHERE (t.fromUser.id = :userId OR t.toUser.id = :userId) " +
           "AND t.isSettled = false " +
           "AND t.transferDate BETWEEN :from AND :to")
    List<Transfer> findUnsettledByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
