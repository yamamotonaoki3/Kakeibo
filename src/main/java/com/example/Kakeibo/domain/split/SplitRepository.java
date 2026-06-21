package com.example.Kakeibo.domain.split;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SplitRepository extends JpaRepository<SplitTransaction, Long> {

    @Query("SELECT st FROM SplitTransaction st " +
           "JOIN FETCH st.paidBy " +
           "JOIN FETCH st.group " +
           "WHERE st.group.id IN :groupIds " +
           "AND (:from IS NULL OR st.splitDate >= :from) " +
           "AND (:to IS NULL OR st.splitDate <= :to) " +
           "ORDER BY st.splitDate DESC, st.createdAt DESC")
    List<SplitTransaction> findByGroupIdsAndDateRange(
            @Param("groupIds") List<Long> groupIds,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT ss FROM SplitShare ss " +
           "JOIN FETCH ss.user " +
           "WHERE ss.splitTransaction.id = :splitId")
    List<SplitShare> findSharesBySplitId(@Param("splitId") Long splitId);

    @Query("SELECT ss FROM SplitShare ss " +
           "JOIN FETCH ss.splitTransaction st " +
           "JOIN FETCH st.paidBy " +
           "WHERE ss.id = :shareId AND ss.user.id = :userId")
    Optional<SplitShare> findShareByIdAndUserId(@Param("shareId") Long shareId, @Param("userId") Long userId);

    @Query("SELECT ss FROM SplitShare ss " +
           "JOIN FETCH ss.user " +
           "JOIN FETCH ss.splitTransaction st " +
           "JOIN FETCH st.paidBy " +
           "WHERE st.group.id IN :groupIds " +
           "AND ss.isSettled = false " +
           "AND (:from IS NULL OR st.splitDate >= :from) " +
           "AND (:to IS NULL OR st.splitDate <= :to)")
    List<SplitShare> findUnsettledSharesByGroupIds(
            @Param("groupIds") List<Long> groupIds,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT ss FROM SplitShare ss " +
           "JOIN FETCH ss.splitTransaction st " +
           "JOIN FETCH st.group " +
           "JOIN FETCH st.paidBy " +
           "WHERE ss.user.id = :userId " +
           "AND (:from IS NULL OR st.splitDate >= :from) " +
           "AND (:to IS NULL OR st.splitDate <= :to) " +
           "ORDER BY st.splitDate DESC")
    List<SplitShare> findSharesByUserId(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
