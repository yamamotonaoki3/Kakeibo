package com.example.Kakeibo.domain.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    List<Transaction> findByUserIdAndDateOrderByDateDesc(Long userId, LocalDate date);

    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.date BETWEEN :start AND :end")
    Long sumAmountByUserIdAndTypeAndDateBetween(@Param("userId") Long userId, @Param("type") TransactionType type, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.account.id = :accountId AND t.type = :type")
    Long sumAmountByAccountIdAndType(@Param("accountId") Long accountId, @Param("type") TransactionType type);

    @Query("SELECT t.date, t.type, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.date BETWEEN :start AND :end GROUP BY t.date, t.type ORDER BY t.date")
    List<Object[]> sumByDayAndTypeForUser(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    List<Transaction> findByUserIdAndCategoryOrderByDateDesc(Long userId, Category category);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:accountId IS NULL OR t.account.id = :accountId) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:memo IS NULL OR t.memo LIKE %:memo%) " +
           "ORDER BY t.date DESC")
    List<Transaction> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("accountId") Long accountId,
            @Param("category") Category category,
            @Param("memo") String memo);
}
