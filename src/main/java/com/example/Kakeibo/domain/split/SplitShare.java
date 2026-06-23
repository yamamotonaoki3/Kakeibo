package com.example.Kakeibo.domain.split;

import com.example.Kakeibo.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "split_shares")
@Getter
@Setter
public class SplitShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "split_transaction_id", nullable = false)
    private SplitTransaction splitTransaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal shareRatio;

    @Column(nullable = false)
    private Long shareAmount;

    @Column(nullable = false)
    private Boolean isSettled = false;

    private LocalDateTime settledAt;
}
