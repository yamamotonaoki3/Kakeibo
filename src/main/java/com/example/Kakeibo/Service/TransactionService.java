package com.example.Kakeibo.Service;

import com.example.Kakeibo.Mapper.TransactionMapper;
import com.example.Kakeibo.Model.Transaction.Transaction;
import com.example.Kakeibo.Model.Transaction.TransactionType;
import com.example.Kakeibo.Repository.TransactionRepository;
import com.example.Kakeibo.dto.MonthlysummaryDto;
import com.example.Kakeibo.dto.TransactionFrom;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;


@Service
public class TransactionService {

    private final TransactionRepository repository;
    private  final TransactionMapper mapper;

    public TransactionService(TransactionRepository repository, TransactionMapper mapper) {

        this.repository = repository;
        this.mapper = mapper;
    }

    //一覧取得


    public List<TransactionFrom> findAll() {
        return repository.findAll().stream()
                .map(mapper::TransactionToFrom)
                .toList();
    }

    //保存(新規 or 更新)
// :::   public void save(TransactionDto form) {
//        if (form.getId() == null) {
//            create(form);
//        } else {
//            update(form);
//        }
//  :::   }

    //削除
    public void delete(Integer id) {
        try {
            repository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new IllegalArgumentException("データが存在しません");
        }
    }

    //ID取得
    public TransactionFrom findById(Integer id) {
        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("データが存在しません"));

        return mapper.TransactionToFrom(transaction);
    }



    //更新
    public void update(TransactionFrom tranDto) {
        Transaction transaction = repository.findById(tranDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("データがありません"));
        mapper.TransactionToEntity(tranDto, transaction);
        repository.save(transaction);
    }


    //新規作成
    public void create(TransactionFrom transactionFrom) {
        Transaction transaction = new Transaction();
// :::       transaction.setDate(form.getDate());
//        transaction.setAmount(form.getAmount());
//        transaction.setCategory(form.getCategory());
//        transaction.setMemo(form.getMemo());
//  :::      transaction.setType(form.getType());
        mapper.TransactionToEntity(transactionFrom,transaction);

        repository.save(transaction);
    }

    public List<TransactionFrom> findByDate(LocalDate date) {
        return repository.findByDate(date).stream()
                .map(mapper::TransactionToFrom)
                .toList();
    }



// :::   //月合計収入
//    public int getMonthlyIncome(int year, int month) {
//        return repository.findAll().stream()
//                .filter(t -> t.getDate().getYear() == year)
//                .filter(t -> t.getDate().getMonthValue() == month)
//                .filter(t -> t.getType() == TransactionType.INCOME)
//                .mapToInt((Transaction::getAmount))
//                .sum();
//    }
//
//    //月合計支出
//    public int getMonthlyExpense(int year, int month) {
//        return repository.findAll().stream()
//                .filter(t -> t.getDate().getYear() == year)
//                .filter(t -> t.getDate().getMonthValue() == month)
//                .filter(t -> t.getType() == TransactionType.EXPENSE)
//                .mapToInt((Transaction::getAmount))
//                .sum();
//    }

    //月合計収支
//    public int getBalance(int getMonthlyExpense, int getMonthlyIncome) {
//        int total = 0;
//        return total = getMonthlyIncome - getMonthlyExpense;
//
//    }
// :::


    // =========================
    // 月次集計（実務版）
    // =========================

    public MonthlysummaryDto getMonthlySummary(int year, int month) {

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        Long income = repository.sumAmountByTypeAndDateBetween(
                TransactionType.INCOME, start, end);

        Long expense = repository.sumAmountByTypeAndDateBetween(
                TransactionType.EXPENSE, start, end);

        return new MonthlysummaryDto(income, expense);
    }

//  :::  public MonthlysummaryDto getMonthlySummary(int year, int month) {
//        List<Transaction> list = repository.findAll();
//
//        int income = 0;
//        int expense = 0;
//
//        for (Transaction t : list) {
//            if (t.getDate().getYear() == year &&
//                    t.getDate().getMonthValue() == month) {
//                if (t.getType() == TransactionType.INCOME) {
//                    income += t.getAmount();
//                } else {
//                    expense += t.getAmount();
//                }
//            }
//        }
//            return new MonthlysummaryDto(income, expense);
//  :::  }


}


