package com.example.Kakeibo.Service;


import com.example.Kakeibo.Model.Transaction.TransactionType;
import com.example.Kakeibo.Repository.TransactionRepository;
import com.example.Kakeibo.dto.DaySummaryDto;
import com.example.Kakeibo.dto.MonthlyCalendarDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CalendarService {

    private final TransactionRepository repository;
    private final TransactionService service;

    public CalendarService(TransactionRepository repository ,
                           TransactionService service)
    {
        this.repository = repository;
        this.service = service;
    }

    public MonthlyCalendarDto createMonthlyCalendar(int year, int month) {

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // ① DBから日別集計取得
        Map<Integer, Long> incomeMap = convertToMap(
                repository.sumByDayAndType(TransactionType.INCOME, start, end)
        );

        Map<Integer, Long> expenseMap = convertToMap(
                repository.sumByDayAndType(TransactionType.EXPENSE, start, end)
        );

        List<DaySummaryDto> days = new ArrayList<>();

        // ② 月初の曜日（空白調整）
        int startDayOfWeek = start.getDayOfWeek().getValue(); // 月=1

        for (int i = 1; i < startDayOfWeek; i++) {
            days.add(null);
        }

        // ③ 日ごとのDTO作成
        for (int day = 1; day <= ym.lengthOfMonth(); day++) {

            long income = incomeMap.getOrDefault(day, 0L);
            long expense = expenseMap.getOrDefault(day, 0L);

            DaySummaryDto dto = new DaySummaryDto();
            dto.setDay(day);
            dto.setIncome(income);
            dto.setExpense(expense);
            dto.setBalance(income - expense);

            days.add(dto);
        }

        // ④ 35マスに揃える
        while (days.size() < 35) {
            days.add(null);
        }

        // ⑤ Monthly DTO作成
        MonthlyCalendarDto result = new MonthlyCalendarDto();
        result.setYear(year);
        result.setMonth(month);
        result.setDays(days);

        return result;
    }

    // 🔥 DB結果をMapに変換（超重要）
    private Map<Integer, Long> convertToMap(List<Object[]> results) {

        Map<Integer, Long> map = new HashMap<>();

        for (Object[] row : results) {
            Integer day = (Integer) row[0];
            Long sum = (Long) row[1];
            map.put(day, sum);
        }

        return map;
    }
}
