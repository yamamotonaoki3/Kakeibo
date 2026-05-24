package com.example.Kakeibo.Controller;

import com.example.Kakeibo.Model.Date.AppDateModel;
import com.example.Kakeibo.Service.CalendarService;
import com.example.Kakeibo.dto.MonthlyCalendarDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {

        this.calendarService = calendarService;
    }

    @GetMapping("/")
    public String top(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Model model) {

        // ① 日付決定（ここがポイント）
        AppDateModel dateModel = resolveDate(year, month);

        // ② カレンダー取得
        MonthlyCalendarDto calendar =
                calendarService.createMonthlyCalendar(
                        dateModel.getYear(),
                        dateModel.getMonth()
                );

        // ③ Viewへ渡す
        model.addAttribute("calendar", calendar);
        model.addAttribute("dateModel", dateModel);
        model.addAttribute("prev", dateModel.prevMonth());
        model.addAttribute("next", dateModel.nextMonth());

        return "top";
    }

    // 🔥 日付解決ロジック（Controllerの外に出さないのがコツ）
    private AppDateModel resolveDate(Integer year, Integer month) {

        if (year == null || month == null) {
            return new AppDateModel(); // 今日
        }

        return AppDateModel.of(year, month);
    }
}
