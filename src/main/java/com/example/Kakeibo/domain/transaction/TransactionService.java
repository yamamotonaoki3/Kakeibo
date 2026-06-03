package com.example.Kakeibo.domain.transaction;

import com.example.Kakeibo.domain.account.Account;
import com.example.Kakeibo.domain.account.AccountRepository;
import com.example.Kakeibo.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public List<Transaction> findByUser(User user) {
        return transactionRepository.findByUserIdOrderByDateDesc(user.getId());
    }

    public List<Transaction> findByUserAndDate(User user, LocalDate date) {
        return transactionRepository.findByUserIdAndDateOrderByDateDesc(user.getId(), date);
    }

    public List<Transaction> findByUserAndMonth(User user, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), start, end);
    }

    public List<Transaction> findByUserAndCategory(User user, Category category) {
        return transactionRepository.findByUserIdAndCategoryOrderByDateDesc(user.getId(), category);
    }

    public List<Transaction> findByUserWithFilters(User user, TransactionType type, Long accountId,
                                                    Category category, String memo) {
        return transactionRepository.findByUserIdWithFilters(user.getId(), type, accountId, category, memo);
    }

    public Transaction findById(Long id, User user) {
        return transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("取引が見つかりません"));
    }

    @Transactional
    public Transaction create(User user, Long accountId, LocalDate date, Long amount,
                              Category category, TransactionType type, String memo) {
        Account account = accountRepository.findById(accountId)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("口座が見つかりません"));
        Transaction t = new Transaction();
        t.setUser(user);
        t.setAccount(account);
        t.setDate(date);
        t.setAmount(amount);
        t.setCategory(category);
        t.setType(type);
        t.setMemo(memo);
        return transactionRepository.save(t);
    }

    @Transactional
    public Transaction update(Long id, User user, Long accountId, LocalDate date, Long amount,
                              Category category, TransactionType type, String memo) {
        Transaction t = findById(id, user);
        Account account = accountRepository.findById(accountId)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("口座が見つかりません"));
        t.setAccount(account);
        t.setDate(date);
        t.setAmount(amount);
        t.setCategory(category);
        t.setType(type);
        t.setMemo(memo);
        return transactionRepository.save(t);
    }

    @Transactional
    public void delete(Long id, User user) {
        Transaction t = findById(id, user);
        transactionRepository.delete(t);
    }
}
