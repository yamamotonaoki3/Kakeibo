package com.example.Kakeibo.domain.account;

import com.example.Kakeibo.domain.transaction.TransactionRepository;
import com.example.Kakeibo.domain.transaction.TransactionType;
import com.example.Kakeibo.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public List<Account> findByUser(User user) {
        return accountRepository.findByUserIdAndArchivedFalse(user.getId());
    }

    public List<Account> findAllByUser(User user) {
        return accountRepository.findByUserId(user.getId());
    }

    public Account findById(Long id, User user) {
        return accountRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("口座が見つかりません"));
    }

    @Transactional
    public Account create(User user, String name, Long initialBalance) {
        Account account = new Account();
        account.setUser(user);
        account.setName(name);
        account.setInitialBalance(initialBalance);
        return accountRepository.save(account);
    }

    @Transactional
    public Account update(Long id, User user, String name, Long initialBalance) {
        Account account = findById(id, user);
        account.setName(name);
        account.setInitialBalance(initialBalance);
        return accountRepository.save(account);
    }

    @Transactional
    public void delete(Long id, User user) {
        Account account = findById(id, user);
        account.setArchived(true);
        accountRepository.save(account);
    }

    public long calcBalance(Account account) {
        long income = transactionRepository.sumAmountByAccountIdAndType(account.getId(), TransactionType.INCOME);
        long expense = transactionRepository.sumAmountByAccountIdAndType(account.getId(), TransactionType.EXPENSE);
        return account.getInitialBalance() + income - expense;
    }
}
