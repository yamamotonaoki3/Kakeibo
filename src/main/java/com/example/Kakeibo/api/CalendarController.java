package com.example.Kakeibo.api;

import com.example.Kakeibo.domain.split.SplitShare;
import com.example.Kakeibo.domain.split.SplitShareRepository;
import com.example.Kakeibo.domain.transaction.TransactionRepository;
import com.example.Kakeibo.domain.transaction.TransactionType;
import com.example.Kakeibo.domain.user.User;
import com.example.Kakeibo.domain.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final TransactionRepository transactionRepository;
    private final SplitShareRepository splitShareRepository;
    private final UserService userService;

    @GetMapping
    public Map<String, Object> calendar(@RequestParam int year,
                                        @RequestParam int month,
                                        Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        long monthIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), TransactionType.INCOME, start, end);
        long monthExpense = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), TransactionType.EXPENSE, start, end);

        List<Object[]> dailyRows = transactionRepository.sumByDayAndTypeForUser(user.getId(), start, end);

        Map<LocalDate, Long> dailyIncome = new HashMap<>();
        Map<LocalDate, Long> dailyExpense = new HashMap<>();
        for (Object[] row : dailyRows) {
            LocalDate date = (LocalDate) row[0];
            TransactionType type = (TransactionType) row[1];
            Long amount = (Long) row[2];
            if (type == TransactionType.INCOME) {
                dailyIncome.put(date, amount);
            } else {
                dailyExpense.put(date, amount);
            }
        }

        // 割り勘の自分の負担額を日別・月別合計に加算
        List<SplitShare> splitShares = splitShareRepository.findByUserId(user.getId(), start, end);
        for (SplitShare share : splitShares) {
            LocalDate d = share.getSplitTransaction().getSplitDate();
            dailyExpense.merge(d, share.getShareAmount(), Long::sum);
            monthExpense += share.getShareAmount();
        }

        List<Map<String, Object>> days = new ArrayList<>();
        int firstDow = start.getDayOfWeek().getValue() % 7;
        for (int i = 0; i < firstDow; i++) {
            days.add(null);
        }
        for (int d = 1; d <= ym.lengthOfMonth(); d++) {
            LocalDate date = ym.atDay(d);
            long inc = dailyIncome.getOrDefault(date, 0L);
            long exp = dailyExpense.getOrDefault(date, 0L);
            Map<String, Object> day = new HashMap<>();
            day.put("day", d);
            day.put("date", date.toString());
            day.put("income", inc);
            day.put("expense", exp);
            day.put("balance", inc - exp);
            days.add(day);
        }

        return Map.of(
                "year", year,
                "month", month,
                "monthIncome", monthIncome,
                "monthExpense", monthExpense,
                "monthBalance", monthIncome - monthExpense,
                "days", days
        );
    }
}
